export type ExperimentConfig={fault?:'lost_ack'|'unavailable'|'invalid_output';policy?:'stop'|'retry'|'verified'};
export type ExperimentResult={calls:number;shipments:number;verified:boolean;success:boolean;events:{label:string;detail:string;tone:string}[]};
export function runExperiment(config?:ExperimentConfig):ExperimentResult;
export function exportPython(config?:ExperimentConfig):string;
