import '@material-ui/core/styles/createMuiTheme';

declare module '@material-ui/core/styles/createMuiTheme' {
  interface Theme {
    map: {
      free: NonNullable<React.CSSProperties['color']>;
      occupied: NonNullable<React.CSSProperties['color']>;
      segment1: NonNullable<React.CSSProperties['color']>;
      segment2: NonNullable<React.CSSProperties['color']>;
      segment3: NonNullable<React.CSSProperties['color']>;
      segment4: NonNullable<React.CSSProperties['color']>;
      segmentFallback: NonNullable<React.CSSProperties['color']>;
      path: NonNullable<React.CSSProperties['color']>;
      noGo: {
        stroke: NonNullable<React.CSSProperties['color']>;
        fill: NonNullable<React.CSSProperties['color']>;
      };
      noMop: {
        stroke: NonNullable<React.CSSProperties['color']>;
        fill: NonNullable<React.CSSProperties['color']>;
      };
      active: {
        stroke: NonNullable<React.CSSProperties['color']>;
        fill: NonNullable<React.CSSProperties['color']>;
      };
    };
  }

  interface ThemeOptions {
    map: {
      free: NonNullable<React.CSSProperties['color']>;
      occupied: NonNullable<React.CSSProperties['color']>;
      segment1: NonNullable<React.CSSProperties['color']>;
      segment2: NonNullable<React.CSSProperties['color']>;
      segment3: NonNullable<React.CSSProperties['color']>;
      segment4: NonNullable<React.CSSProperties['color']>;
      segmentFallback: NonNullable<React.CSSProperties['color']>;
      path: NonNullable<React.CSSProperties['color']>;
      noGo: {
        stroke: NonNullable<React.CSSProperties['color']>;
        fill: NonNullable<React.CSSProperties['color']>;
      };
      noMop: {
        stroke: NonNullable<React.CSSProperties['color']>;
        fill: NonNullable<React.CSSProperties['color']>;
      };
      active: {
        stroke: NonNullable<React.CSSProperties['color']>;
        fill: NonNullable<React.CSSProperties['color']>;
      };
    };
  }
}
