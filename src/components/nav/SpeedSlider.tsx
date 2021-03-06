import React from "react";
import { Slider, SliderFilledTrack, SliderMark, SliderThumb, SliderTrack, Tooltip } from "@chakra-ui/react"

/**
 * Slider to modify run step speed
 * @param onChange handler, onChange handler for speed
 * @param open boolean, controls if tooltip opens
 */
const SpeedSlider = ({onChange, open}) => {
    const [sliderValue, setSliderValue] = React.useState(5);
    const [showTooltip, setShowTooltip] = React.useState(false);

    return (
      <Slider
        id='slider'
        defaultValue={5}
        min={20}
        max={100}
        width={150}
        colorScheme='teal'
        onChange={(v) => { setSliderValue(v); onChange(v); }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <Tooltip
          bg='blue.600'
          color='white'
          placement='top-start'
          isOpen={open}
          label={`Running Speed`}
        > </Tooltip>
        <SliderMark value={25} mt='1' ml='-2.5' fontSize='sm'>
          25%
        </SliderMark>
        <SliderMark value={50} mt='1' ml='-2.5' fontSize='sm'>
          50%
        </SliderMark>
        <SliderMark value={75} mt='1' ml='-2.5' fontSize='sm'>
          75%
        </SliderMark>
        <SliderTrack>
          <SliderFilledTrack />
        </SliderTrack>
        <Tooltip
          hasArrow
          bg='teal.500'
          color='white'
          placement='top'
          isOpen={showTooltip}
          label={`${sliderValue}%`}
        >
          <SliderThumb />
        </Tooltip>
      </Slider>
    )
  };

export default SpeedSlider;