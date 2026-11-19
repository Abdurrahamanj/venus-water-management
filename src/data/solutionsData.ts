import type { SolutionItem } from '../components/SolutionCard';

export const SOLUTIONS_DATA: SolutionItem[] = [
  {
    id: 'water-treatment',
    title: 'Water Treatment Solutions',
    subtitle: 'Advanced Purification Systems',
    description:
      'Proposed modular filtration and high-performance purification systems aimed at transforming raw, brackish, and municipal sources into certified potable and process-ready water.',
    image: '/images/effluent-treatment.jpg',
    features: [
      'Multi-barrier membrane ultrafiltration',
      'Reverse osmosis (RO) desalinization schemes',
      'Advanced oxidation & UV disinfection',
      'Continuous real-time water quality sensing',
    ],
    proposedTag: 'Proposed Category',
  },
  {
    id: 'wastewater-management',
    title: 'Wastewater Management',
    subtitle: 'Effluent Clarification & Treatment',
    description:
      'Engineered wastewater mitigation designed for municipal and industrial runoff, minimizing environmental discharge footprints through biological and chemical neutralization.',
    image: '/images/sewage-treatment.jpg',
    features: [
      'Biological nutrient removal (BNR)',
      'Membrane bioreactor (MBR) processing',
      'Sludge dewatering & resource stabilization',
      'Strict regulatory compliance monitoring',
    ],
    proposedTag: 'Proposed Category',
  },
  {
    id: 'industrial-water-management',
    title: 'Industrial Water Management',
    subtitle: 'Manufacturing & Process Cooling',
    description:
      'Targeted solutions engineered for heavy industries, power facilities, and chemical manufacturing to control scaling, corrosion, and microbiological biofouling in cooling towers.',
    image: '/images/zero-liquid-discharge.jpg',
    features: [
      'Boiler feed water demineralization',
      'Cooling circuit chemical optimization',
      'Zero Liquid Discharge (ZLD) system layouts',
      'Process closed-loop recovery circuits',
    ],
    proposedTag: 'Proposed Category',
  },
  {
    id: 'water-recycling-reuse',
    title: 'Water Recycling and Reuse',
    subtitle: 'Circular Water Economics',
    description:
      'Transforming treated secondary effluent into high-grade reclaimed water for non-potable commercial applications, agricultural irrigation, and groundwater aquifer replenishment.',
    image: '/images/reverse-osmosis.jpg',
    features: [
      'Tertiary polishing & micro-filtration',
      'Greywater separation & decentralized reuse',
      'Industrial recycling for zero net intake',
      'Lifecycle carbon & energy mitigation',
    ],
    proposedTag: 'Proposed Category',
  },
  {
    id: 'water-conservation',
    title: 'Water Conservation',
    subtitle: 'Efficiency Audits & Smart Flow',
    description:
      'Strategic conservation engineering featuring acoustic leak detection, pressure management regimes, and automated telemetry to stem system losses and optimize per-capita demand.',
    image: '/images/rainwater-harvesting.jpg',
    features: [
      'Comprehensive non-revenue water (NRW) reduction',
      'Smart ultrasonic metering & telemetry',
      'Demand-side flow equalization',
      'Resource stewardship reporting',
    ],
    proposedTag: 'Proposed Category',
  },
  {
    id: 'sustainable-infrastructure',
    title: 'Sustainable Water Infrastructure',
    subtitle: 'Resilient Civil Water Works',
    description:
      'Long-term asset modernization focusing on climate-resilient distribution mains, stormwater retention basins, and renewable-powered pumping architecture.',
    image: '/images/smart-iot-monitoring.jpg',
    features: [
      'Low-carbon pipeline materials & hydraulic modeling',
      'Solar-integrated pumping stations',
      'Nature-based stormwater retention wetlands',
      'Predictive structural asset lifecycle management',
    ],
    proposedTag: 'Proposed Category',
  },
];
