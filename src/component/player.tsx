import { RigidBody, useRapier } from "@react-three/rapier";
import { useFrame } from "@react-three/fiber";
import { useGLTF, useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";
import { useState, useEffect, useRef } from "react";
import * as RAPIER from "@dimforge/rapier3d-compat";
import useGame from '../hooks/useGame'

export default function Player() {

  const body = useRef<any>();
  const [subscribeKeys, getKeys] = useKeyboardControls();
  const { rapier, world } = useRapier();
  const rapierWorld = world.raw();
  const start = useGame((state: any) => state.start)
  const end = useGame((state: any) => state.end)
  const restart = useGame((state: any) => state.restart)
  const blocksCount = useGame((state: any) => state.blocksCount)
  const beachBallModel = useGLTF('https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/beach-ball/model.gltf')

  const [ smoothedCameraPosition ] = useState(() => new THREE.Vector3(10, 10, 10))
  const [ smoothedCameraTarget ] = useState(() => new THREE.Vector3())

  const reset = () => {
    body.current.setTranslation({ x: 0, y: 1, z: 0 }) // 원점으로 되돌리기 위해. 
    body.current.setLinvel({ x: 0, y: 0, z: 0 }) // 번역력을 제거 하기 위해. 
    body.current.setAngvel({ x: 0, y: 0, z: 0 })  // 각력을 제거 하기 위해.
  }


  const jump = () => {
    const origin = body.current.translation();
    origin.y -= 0.31;
    const direction = { x: 0, y: -1, z: 0 };
    const ray = new rapier.Ray(origin, direction);

    // @ts-ignore
    const hit = rapierWorld.castRay(ray, 10, true)

    // @ts-ignore
    if (hit.toi < 0.15) {
      body.current.applyImpulse({ x: 0, y: 0.5, z: 0 });
    }
  };

  
  
  useEffect(() =>
  {
      const unsubscribeReset = useGame.subscribe(
          (state: any) => state.phase,
          (value) =>
          {
              if(value === 'ready')
                  reset()
          }
      )

      const unsubscribeAny = subscribeKeys(
          () =>
          {
              start()
          }
      )

      const unsubscribeJump = subscribeKeys(
        (state: any) => state.jump,
        (value) =>
        {
            if(value)
                jump()
        }
    )   
      return () =>
      {
          unsubscribeReset()
          unsubscribeJump()
          unsubscribeAny()
      }
  }, [])



  useFrame((state, delta) =>
  {
      /**
       * Controls
       */
      const { forward, backward, leftward, rightward } = getKeys()

      const impulse = { x: 0, y: 0, z: 0 }
      const torque = { x: 0, y: 0, z: 0 }

      const impulseStrength = 0.6 * delta
      const torqueStrength = 0.2 * delta

      if(forward)
      {
          impulse.z -= impulseStrength
          torque.x -= torqueStrength
      }

      if(rightward)
      {
          impulse.x += impulseStrength
          torque.z -= torqueStrength
      }

      if(backward)
      {
          impulse.z += impulseStrength
          torque.x += torqueStrength
      }
      
      if(leftward)
      {
          impulse.x -= impulseStrength
          torque.z += torqueStrength
      }

      body.current.applyImpulse(impulse)
      body.current.applyTorqueImpulse(torque)

      /**
       * Camera
       */
      const bodyPosition = body.current.translation()
  
      const cameraPosition = new THREE.Vector3()
      cameraPosition.copy(bodyPosition)
      cameraPosition.z += 2.25
      cameraPosition.y += 0.65

      const cameraTarget = new THREE.Vector3()
      cameraTarget.copy(bodyPosition)
      cameraTarget.y += 0.25

      smoothedCameraPosition.lerp(cameraPosition, 5 * delta)
      smoothedCameraTarget.lerp(cameraTarget, 5 * delta)

      state.camera.position.copy(smoothedCameraPosition)
      state.camera.lookAt(smoothedCameraTarget)

      /**
      * Phases
      */
      if(bodyPosition.z < - (blocksCount * 4 + 2))
          end()

      if(bodyPosition.y < - 4)
          restart()
  })

  return (
    <>
      {/* @ts-ignore */}
      <RigidBody
        ref={body}
        colliders="ball"
        restitution={0.2}
        friction={1}
        linearDamping={0.5}
        angularDamping={0.5}
        position={[0, 1, 0]}
      >
        <mesh castShadow>
          <icosahedronGeometry args={[0.3, 1]} />
          <meshStandardMaterial flatShading color="mediumpurple" />
        </mesh>
      </RigidBody>
    </>
  );
}
