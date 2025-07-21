export class WaspSource{
    constructor(
        public _source: WaspSourceContent
    ){}
}

export class WaspSourceContent{
    constructor(
        public date: Date,
        public temperature: number,
        public soil_temperature: number,
        public luminosity: number
    ){}
}

