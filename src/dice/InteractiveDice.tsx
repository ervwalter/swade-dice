import { useCallback, useEffect, useRef, useState } from "react";
import { useSpring, animated, config } from "@react-spring/three";
import { ThreeEvent, useThree } from "@react-three/fiber";
import * as THREE from "three";

import { Die } from "../types/Die";
import { Dice } from "./Dice";
import { useDiceRollStore } from "./store";
import { DiceVector3 } from "../types/DiceVector3";
import { DRAG_HEIGHT } from "../constants/savageWorlds";

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

/** Custom dice can be dragged but not re-rolled in Savage Worlds */
export function InteractiveDice(
  props: JSX.IntrinsicElements["group"] & {
    die: Die;
  }
) {
  const diceRef = useRef<THREE.Group>(null);
  const [dragAnchor, setDragAnchor] = useState<DiceVector3 | null>(null);
  const pointerDownPositionRef = useRef<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const { invalidate, size, camera } = useThree();
  const clearRoll = useDiceRollStore((state) => state.clearRoll);
  const finishedDice = useDiceRollStore((state) => state.finishedDice);
  
  // Check if this die is finished and should be immovable
  const isFinished = finishedDice.includes(props.die.id);

  const handlePointerDown = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      // Don't allow dragging finished dice
      if (isFinished) return;
      
      const dice = diceRef.current;
      if (dice && e.target instanceof HTMLCanvasElement) {
        invalidate();
        // Find pointer location in world space
        const x = Math.min(Math.max(e.offsetX, 0), size.width);
        const y = Math.min(Math.max(e.offsetY, 0), size.height);
        pointer.x = (x / size.width) * 2 - 1;
        pointer.y = -((y / size.height) * 2 - 1);
        raycaster.setFromCamera(pointer, camera);
        const position = raycaster.ray.origin.add(
          raycaster.ray.direction.multiplyScalar(camera.position.y - DRAG_HEIGHT)
        );

        setDragAnchor({
          x: position.x - dice.position.x,
          y: DRAG_HEIGHT,
          z: position.z - dice.position.z,
        });

        pointerDownPositionRef.current = { x: e.offsetX, y: e.offsetY };
      }
    },
    [size.width, size.height, isFinished, camera, invalidate]
  );


  useEffect(() => {
    if (dragAnchor) {
      const handleUp = (e: PointerEvent) => {
        setDragAnchor(null);
      };

      const handleMove = (e: PointerEvent) => {
        const dice = diceRef.current;
        if (dragAnchor && dice && e.target instanceof HTMLCanvasElement) {
          // Find pointer location in world space
          const x = Math.min(Math.max(e.offsetX, 0), size.width);
          const y = Math.min(Math.max(e.offsetY, 0), size.height);
          pointer.x = (x / size.width) * 2 - 1;
          pointer.y = -((y / size.height) * 2 - 1);
          raycaster.setFromCamera(pointer, camera);
          const position = raycaster.ray.origin.add(
            raycaster.ray.direction.multiplyScalar(
              camera.position.y - DRAG_HEIGHT
            )
          );

          // Offset initial anchor position
          const newDiceX = position.x - dragAnchor.x;
          const newDiceZ = position.z - dragAnchor.z;

          dice.position.set(newDiceX, dice.position.y, newDiceZ);
          invalidate();
        }
      };
      window.addEventListener("pointerup", handleUp);
      window.addEventListener("pointermove", handleMove);

      return () => {
        window.removeEventListener("pointerup", handleUp);
        window.removeEventListener("pointermove", handleMove);
      };
    }
  }, [
    dragAnchor,
    camera,
    size.width,
    size.height,
    props.die.id,
    invalidate,
  ]);

  useEffect(() => {
    invalidate();
  }, [dragAnchor, invalidate]);

  const { position } = useSpring({
    position: (dragAnchor
      ? [dragAnchor.x, dragAnchor.y, dragAnchor.z]
      : [0, 0, 0]) as [number, number, number],
    onChange: () => {
      invalidate();
    },
    config: dragAnchor ? config.wobbly : config.stiff,
  });

  return (
    <animated.group position={position}>
      <Dice onPointerDown={handlePointerDown} ref={diceRef} {...props}></Dice>
    </animated.group>
  );
}