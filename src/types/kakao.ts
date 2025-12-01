export interface KakaoListCardItem {
  title: string;
  description: string;
  imageUrl: string;
  link: { web: string };
}

export interface KakaoListCardResponse {
  version: "2.0";
  template: {
    outputs: [
      {
        listCard: {
          header: { title: string };
          items: KakaoListCardItem[];
          buttons: Array<{
            action: "webLink";
            label: string;
            webLinkUrl: string;
          }>;
        };
      },
    ];
  };
}

export interface KakaoCarouselItem {
  description: string;
}

export interface KakaoCarouselResponse {
  version: "2.0";
  template: {
    outputs: [
      {
        carousel: {
          type: "textCard";
          items: KakaoCarouselItem[];
        };
      },
    ];
  };
}

export interface KakaoErrorResponse {
  error: string;
}
