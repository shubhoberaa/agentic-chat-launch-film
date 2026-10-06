import React from "react";
import { Composition } from "remotion";
import { LaunchFilm as ExtendedFilm, TOTAL as EXTENDED_TOTAL } from "./Video";
import { LaunchFilm, TOTAL } from "./ShortFilm";
import { FPS } from "./theme";

export const Root: React.FC = () => (
  <>
    <Composition id="Launch" component={LaunchFilm} durationInFrames={TOTAL} fps={FPS} width={1920} height={1080} />
    <Composition id="Extended" component={ExtendedFilm} durationInFrames={EXTENDED_TOTAL} fps={FPS} width={1920} height={1080} />
  </>
);
