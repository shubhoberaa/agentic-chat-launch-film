import React from "react";
import { Composition } from "remotion";
import { LaunchFilm, TOTAL } from "./Video";
import { FPS } from "./theme";
export const Root: React.FC = () => (
  <Composition id="Launch" component={LaunchFilm} durationInFrames={TOTAL} fps={FPS} width={1920} height={1080} />
);
