export interface WalkthroughStep {
  title: string;
  description: string;
  image: string;
  alt: string;
}

export const walkthroughSteps: WalkthroughStep[] = [
  {
    title: "Check In",
    description: "Client arrives and checks in using our simple interface",
    image: "/stap 1 chack in.jpeg",
    alt: "Client checking in at salon reception"
  },
  {
    title: "Select Service",
    description: "Choose the hair service and color treatment needed",
    image: "/stepn 2 select service.jpeg",
    alt: "Selecting hair service on tablet"
  },
  {
    title: "Scan Tube",
    description: "Scan the hair color tube to track usage automatically",
    image: "/step 3 scan tube.jpeg",
    alt: "Scanning hair color tube with barcode scanner"
  },
  {
    title: "Squeeze Color",
    description: "Dispense the exact amount needed - no waste, perfect results",
    image: "/step 4 squiz the color.jpeg",
    alt: "Dispensing hair color from tube"
  },
  {
    title: "Track & Save",
    description: "System automatically tracks usage and calculates savings",
    image: "/step_5.jpg",
    alt: "Final step showing tracking and savings dashboard"
  }
]; 