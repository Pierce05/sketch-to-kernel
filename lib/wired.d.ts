import "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "wired-button": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & { elevation?: number },
        HTMLElement
      >;
      "wired-card": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & { elevation?: number; fill?: string },
        HTMLElement
      >;
      "wired-input": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          placeholder?: string;
          value?: string;
          type?: string;
        },
        HTMLElement
      >;
      "wired-divider": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & { elevation?: number },
        HTMLElement
      >;
    }
  }
}
