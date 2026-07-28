import { Composition } from "remotion";
import { AdultoVideo } from "./AdultoVideo";
import { InfantilVideo } from "./InfantilVideo";

export const RemotionRoot = () => (
  <>
    <Composition
      id="adulto"
      component={AdultoVideo}
      durationInFrames={480}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="infantil"
      component={InfantilVideo}
      durationInFrames={450}
      fps={30}
      width={1920}
      height={1080}
    />
  </>
);
