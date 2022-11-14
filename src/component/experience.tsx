import { OrbitControls } from "@react-three/drei";
import { Physics, Debug } from '@react-three/rapier'
import Level, { BlockSpinner } from "./level";
import useGame from "../hooks/useGame";
import Lights from "./lights";
import Player from "./player";
import Effects from "./effects";

export default function Experience() {

    const blocksCount = useGame((state: any) => { return state.blocksCount })
    const blocksSeed = useGame((state: any) => state.blocksSeed)

    return (
        <>
            {/* <OrbitControls makeDefault /> */}
            <color args={ [ '#252731' ] } attach="background" />

            <Physics>
                {/* <Debug /> */}
                <Lights />
                <Level count={ blocksCount } seed={ blocksSeed } />
                <Player />
            </Physics>

            <Effects />
        </>
    )
}