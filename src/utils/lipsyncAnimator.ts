// Viseme to mouth shape mapping
export interface Viseme {
  time: number;
  phoneme: string;
  mouthShape: MouthShape;
}

export interface MouthShape {
  openness: number; // 0-1, how open the mouth is
  width: number; // 0-1, how wide the mouth is
  height: number; // 0-1, vertical mouth height
}

// Map phonemes to mouth shapes based on Papuga Lipsync API
const PHONEME_TO_MOUTH: Record<string, MouthShape> = {
  // Closed mouth sounds
  'P': { openness: 0.0, width: 0.3, height: 0.2 },
  'B': { openness: 0.0, width: 0.3, height: 0.2 },
  'M': { openness: 0.0, width: 0.3, height: 0.2 },
  
  // Slightly open
  'F': { openness: 0.2, width: 0.4, height: 0.3 },
  'V': { openness: 0.2, width: 0.4, height: 0.3 },
  
  // Medium open
  'TH': { openness: 0.3, width: 0.5, height: 0.4 },
  'S': { openness: 0.3, width: 0.5, height: 0.3 },
  'Z': { openness: 0.3, width: 0.5, height: 0.3 },
  
  // Wide
  'EE': { openness: 0.4, width: 0.8, height: 0.3 },
  'I': { openness: 0.4, width: 0.7, height: 0.3 },
  
  // Open
  'AA': { openness: 0.8, width: 0.6, height: 0.7 },
  'AH': { openness: 0.7, width: 0.6, height: 0.6 },
  'O': { openness: 0.6, width: 0.5, height: 0.6 },
  
  // Very open
  'AW': { openness: 0.9, width: 0.7, height: 0.8 },
  
  // Rounded
  'OO': { openness: 0.5, width: 0.4, height: 0.6 },
  'UH': { openness: 0.5, width: 0.4, height: 0.5 },
  
  // Default/neutral
  'SIL': { openness: 0.1, width: 0.5, height: 0.2 },
};

export class LipsyncAnimator {
  private visemes: Viseme[] = [];
  private startTime: number = 0;
  private isPlaying: boolean = false;
  private animationFrameId: number | null = null;

  constructor(
    private canvas: HTMLCanvasElement,
    private avatarImage: HTMLImageElement,
    private onMouthShapeChange?: (shape: MouthShape) => void
  ) {}

  loadVisemes(visemeData: any[]) {
    this.visemes = visemeData.map(v => ({
      time: v.time,
      phoneme: v.phoneme,
      mouthShape: PHONEME_TO_MOUTH[v.phoneme] || PHONEME_TO_MOUTH['SIL']
    }));
  }

  start() {
    if (this.isPlaying) return;
    
    this.isPlaying = true;
    this.startTime = Date.now();
    this.animate();
  }

  stop() {
    this.isPlaying = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private animate = () => {
    if (!this.isPlaying) return;

    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;

    const currentTime = (Date.now() - this.startTime) / 1000; // Convert to seconds
    const currentViseme = this.getCurrentViseme(currentTime);

    // Clear canvas
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw avatar
    ctx.drawImage(this.avatarImage, 0, 0, this.canvas.width, this.canvas.height);

    // Draw mouth overlay based on current viseme
    if (currentViseme) {
      this.drawMouth(ctx, currentViseme.mouthShape);
      this.onMouthShapeChange?.(currentViseme.mouthShape);
    }

    this.animationFrameId = requestAnimationFrame(this.animate);
  };

  private getCurrentViseme(time: number): Viseme | null {
    if (this.visemes.length === 0) return null;

    // Find the viseme that should be displayed at current time
    for (let i = 0; i < this.visemes.length; i++) {
      if (i === this.visemes.length - 1) {
        return this.visemes[i];
      }
      
      if (time >= this.visemes[i].time && time < this.visemes[i + 1].time) {
        return this.visemes[i];
      }
    }

    return this.visemes[this.visemes.length - 1];
  }

  private drawMouth(ctx: CanvasRenderingContext2D, shape: MouthShape) {
    const centerX = this.canvas.width * 0.5;
    const centerY = this.canvas.height * 0.65;
    
    const mouthWidth = this.canvas.width * 0.15 * shape.width;
    const mouthHeight = 10 * shape.openness * shape.height;

    // Draw mouth shape
    ctx.save();
    ctx.fillStyle = 'rgba(60, 20, 10, 0.6)';
    ctx.beginPath();
    ctx.ellipse(
      centerX,
      centerY,
      mouthWidth,
      mouthHeight,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.restore();

    // Add lip definition
    ctx.save();
    ctx.strokeStyle = 'rgba(40, 10, 5, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(
      centerX,
      centerY,
      mouthWidth,
      mouthHeight,
      0,
      0,
      Math.PI * 2
    );
    ctx.stroke();
    ctx.restore();
  }
}
