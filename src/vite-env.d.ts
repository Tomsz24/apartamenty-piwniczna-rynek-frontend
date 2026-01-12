
/// <reference types="vite/client" />

declare module 'ical.js' {
  export function parse(input: string): any;

  export class Component {
    constructor(jCal: any);
    getAllSubcomponents(name: string): Component[];
  }

  export class Event {
    constructor(component: Component);
    uid: string;
    summary: string;
    startDate: Time;
    endDate: Time;
  }

  export class Time {
    toJSDate(): Date;
  }
}

interface ImportMetaEnv {
  readonly VITE_APARTMENT_1_ICAL_TOKEN: string;
  readonly VITE_APARTMENT_2_ICAL_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
