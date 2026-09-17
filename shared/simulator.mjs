/** A deterministic local tool simulation. No LLM, network, or real shipment is used. */
export function runExperiment({
  fault = "lost_ack",
  policy = "verified",
} = {}) {
  if (
    !["lost_ack", "unavailable", "invalid_output"].includes(fault) ||
    !["stop", "retry", "verified"].includes(policy)
  )
    throw new TypeError("Unknown experiment configuration");
  let calls = 0;
  let shipments = 0;
  let verified = false;
  const ledger = new Map();
  const events = [];
  const record = (label, detail, tone = "neutral") =>
    events.push({ label, detail, tone });
  const create = (key) => {
    calls++;
    record(
      "Call tool",
      `create_shipment(${key ? '"order-1042"' : "no idempotency key"})`,
    );
    if (fault === "unavailable" && calls === 1) {
      record(
        "Service unavailable",
        "The request failed before any shipment was created.",
        "error",
      );
      throw new Error("503");
    }
    if (key && ledger.has(key)) {
      record(
        "Existing result found",
        "The tool returns the original shipment. No second shipment.",
        "good",
      );
      return ledger.get(key);
    }
    shipments++;
    const result = { shipmentId: `S-${shipments}`, status: "created" };
    if (key) ledger.set(key, result);
    record(
      "Shipment committed",
      `Shipment ${result.shipmentId} exists in the tool ledger.`,
    );
    if (fault === "lost_ack" && calls === 1) {
      record(
        "Acknowledgement lost",
        "The action succeeded, but the agent received a timeout.",
        "error",
      );
      throw new Error("timeout");
    }
    if (fault === "invalid_output" && calls === 1) {
      record(
        "Malformed result",
        "The response is missing its shipment identifier.",
        "error",
      );
      return { status: "created" };
    }
    record(
      "Result received",
      `Shipment ${result.shipmentId} acknowledged.`,
      "good",
    );
    return result;
  };
  const isValid = (result) =>
    typeof result?.shipmentId === "string" && result.status === "created";
  const key = policy === "verified" ? "order-1042" : undefined;
  try {
    const result = create(key);
    if (policy === "verified" && !isValid(result))
      throw new Error("invalid response");
    verified = isValid(result);
    if (!verified)
      record(
        "Unchecked response",
        "The policy stops without a valid shipment identifier.",
        "error",
      );
  } catch {
    if (policy === "stop") {
      record(
        "Agent stops",
        "No retry. The outcome still needs reconciliation.",
        "error",
      );
    } else {
      record(
        policy === "verified"
          ? "Recover with stable identity"
          : "Retry without identity",
        policy === "verified"
          ? "Reuse the same operation key and validate the result."
          : "A second call may repeat an already committed action.",
      );
      const result = create(key);
      verified = isValid(result);
    }
  }
  const success = shipments === 1 && verified;
  record(
    success ? "Verified completion" : "Unresolved outcome",
    success
      ? "Exactly one shipment, with a validated acknowledgement."
      : shipments > 1
        ? "Duplicate shipments. A successful response hid a repeated side effect."
        : shipments === 0
          ? "No shipment was created."
          : "One shipment exists, but the agent cannot verify its identifier.",
    success ? "good" : "error",
  );
  return { calls, shipments, verified, success, events };
}
export function exportPython({ fault = "lost_ack", policy = "verified" } = {}) {
  runExperiment({ fault, policy });
  return `"""Shivam's agent reliability lab: deterministic simulation, no network or LLM.\nRun: python3 experiment.py\nSource: https://github.com/shi1720/shivam-portfolio\n"""\nFAULT = ${JSON.stringify(fault)}\nPOLICY = ${JSON.stringify(policy)}\nledger = {}\nshipments = []\ncalls = 0\n\ndef create_shipment(key=None):\n    global calls\n    calls += 1\n    if FAULT == "unavailable" and calls == 1:\n        raise ConnectionError("503 before commit")\n    if key and key in ledger:\n        return ledger[key]\n    result = {"shipmentId": f"S-{len(shipments)+1}", "status": "created"}\n    shipments.append(result)\n    if key:\n        ledger[key] = result\n    if FAULT == "lost_ack" and calls == 1:\n        raise TimeoutError("committed, acknowledgement lost")\n    if FAULT == "invalid_output" and calls == 1:\n        return {"status": "created"}\n    return result\n\ndef valid(result):\n    return isinstance(result.get("shipmentId"), str) and result.get("status") == "created"\n\nkey = "order-1042" if POLICY == "verified" else None\nverified = False\ntry:\n    result = create_shipment(key)\n    if POLICY == "verified" and not valid(result):\n        raise ValueError("invalid response")\n    verified = valid(result)\nexcept (ConnectionError, TimeoutError, ValueError):\n    if POLICY != "stop":\n        verified = valid(create_shipment(key))\n\nprint({"calls": calls, "shipments": len(shipments), "verified": verified})\nprint("PASS: exactly one verified shipment" if len(shipments) == 1 and verified else "FAIL: inspect the outcome")\n`;
}
