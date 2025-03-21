
import React from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface CreativitySliderProps {
  creativity: number;
  onCreativityChange: (value: number) => void;
}

const CreativitySlider: React.FC<CreativitySliderProps> = ({
  creativity,
  onCreativityChange,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <Label>Creativity Level</Label>
        <span className="text-sm text-muted-foreground">{creativity}%</span>
      </div>
      <Slider
        value={[creativity]}
        min={0}
        max={100}
        step={1}
        onValueChange={([value]) => onCreativityChange(value)}
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Conservative</span>
        <span>Balanced</span>
        <span>Creative</span>
      </div>
    </div>
  );
};

export default CreativitySlider;
