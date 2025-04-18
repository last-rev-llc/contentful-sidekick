export interface MetaTagMessage {
  name: string;
}

export interface PageContent {
  html: string;
  text: string;
}

export interface ProtocolMap {
  getMetaTag: {
    input: MetaTagMessage;
    output: string | null;
  };
  getPageContent: {
    input: void;
    output: PageContent;
  };
}
