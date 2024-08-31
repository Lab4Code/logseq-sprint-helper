export interface Block {
  properties: Properties;
  parent: Parent;
  children: Block[];
  id: number;
  pathRefs: PathRef[];
  propertiesTextValues?: PropertiesTextValues;
  level: number;
  uuid: string;
  content: string;
  page: Page;
  propertiesOrder: string[];
  left: Left;
  format: string;
  refs?: Ref[];
}

export interface Properties {
  backgroundColor?: string;
  heading: number;
}

export interface Parent {
  id: number;
}

export interface PathRef {
  id: number;
}

export interface PropertiesTextValues {
  backgroundColor: string;
}

export interface Page {
  id: number;
}

export interface Left {
  id: number;
}

export interface Ref {
  id: number;
}
