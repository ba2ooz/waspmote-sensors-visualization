export class WaspMeteoSource{
    constructor(
        public _source: WaspMeteoSourceContent
    ){}
}

export class WaspMeteoSourceContent{
    constructor(
        public date: Date,
        public anemometer: number,
        public pulviometer1: number,
        public pulviometer2: number,
        public pulviometer3: number,
        public vane: String,
        public battery: number,
        public temperature: number,
        public soil_temperature: number,
        public luminosity: number
    ){}
}
