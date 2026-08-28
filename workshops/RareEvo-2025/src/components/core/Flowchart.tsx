'use client';

import { useEffect, useRef } from "react";
import mermaid from "mermaid";
import Image from "next/image";

// Define a type for the stepType prop
type StepType = 'introduction' | 'did' | 'oobIssuer' | 'oobHolder' | 'issuance' | 'credentials' | 'presentationRequest' | 'present' | 'presentationVerify';

interface FlowchartProps {
  stepType: StepType;
}

// Styling variables for diagrams
const DIAGRAM_STYLES = {
  colors: {
    primary: '#FFD700',     // light blue for active elements
    success: '#90EE90',     // light green for completed elements
    default: '#ccc',        // default gray for inactive elements
    text: '#000'            // text color
  },
  strokeWidths: {
    active: '8px',
    activeLink: '8px',
    highlight: '8px',
    default: '8px'
  }
};

const Flowchart = ({ stepType }: FlowchartProps) => {
  const mermaidRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: "default",
      securityLevel: 'loose',
      themeVariables: {
        primaryColor: DIAGRAM_STYLES.colors.primary,
        secondaryColor: "#9370DB", // purple
        tertiaryColor: DIAGRAM_STYLES.colors.success,
        success: "#228B22", // green
      },
      // Add configuration for full width rendering
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
      }
    });
  }, []);

  // Re-render diagram when stepType changes
  useEffect(() => {
    // Define different diagrams based on stepType
    const getDiagram = (step: StepType) => {
      switch (step) {
        case 'introduction':
          return `
          graph LR
            Issuer[<img src="/identus-logo.svg" height="20" style="vertical-align:middle" alt="Issuer"/> Issuer] -- "<b>Issuer PrismDID</b><br>Create DID<br>Publish onChain" --> Blockchain[<img src="/cardano-ada-logo.webp" height="20" style="vertical-align:middle" alt="Blockchain"/> Cardano Blockchain]
            Issuer -- "<b>Credential Offer</b><br>Create Offer<br>Share OOB/QRCode" --> Holder[<img src="/lace.svg" height="20" style="vertical-align:middle" alt="Holder"/> Holder]
            Holder -- "<b>Credential Request</b><br>Review Offer<br>Send Request" --> Issuer
            Issuer -- "<b>Creential Issuance</b><br>Approve Request<br>Issue Credential" --> Holder
            Verifier[<img src="/identus-logo.svg" height="20" style="vertical-align:middle" alt="Verifier"/> Verifier] -- "<b>Presentation Request</b><br>Create Request<br>Share OOB/QRCode" --> Holder
            Holder -- "<b>Verifiable Presentation</b><br>Choose credential<br>Send Presentation" --> Verifier
            Verifier -- "<b>Verify credential</b><br>Resolve Issuer DID<br>Verify signatures + proofs" --> Blockchain

            style Issuer fill:none,stroke:${DIAGRAM_STYLES.colors.default},stroke-width:${DIAGRAM_STYLES.strokeWidths.highlight}
            style Blockchain fill:none,stroke:${DIAGRAM_STYLES.colors.default},stroke-width:${DIAGRAM_STYLES.strokeWidths.highlight},color:${DIAGRAM_STYLES.colors.text}
            style Holder fill:none,stroke:${DIAGRAM_STYLES.colors.default},stroke-width:${DIAGRAM_STYLES.strokeWidths.highlight}
            style Verifier fill:none,stroke:${DIAGRAM_STYLES.colors.default},stroke-width:${DIAGRAM_STYLES.strokeWidths.highlight},color:${DIAGRAM_STYLES.colors.text}


            linkStyle 0 stroke:${DIAGRAM_STYLES.colors.default},stroke-width:${DIAGRAM_STYLES.strokeWidths.highlight},stroke-dasharray:0 !important;
            linkStyle 1 stroke:${DIAGRAM_STYLES.colors.default},stroke-width:${DIAGRAM_STYLES.strokeWidths.highlight},stroke-dasharray:0 !important;
            linkStyle 2 stroke:${DIAGRAM_STYLES.colors.default},stroke-width:${DIAGRAM_STYLES.strokeWidths.highlight},stroke-dasharray:0 !important;
            linkStyle 3 stroke:${DIAGRAM_STYLES.colors.default},stroke-width:${DIAGRAM_STYLES.strokeWidths.highlight},stroke-dasharray:0 !important;
            linkStyle 4 stroke:${DIAGRAM_STYLES.colors.default},stroke-width:${DIAGRAM_STYLES.strokeWidths.highlight},stroke-dasharray:0 !important;
            linkStyle 5 stroke:${DIAGRAM_STYLES.colors.default},stroke-width:${DIAGRAM_STYLES.strokeWidths.highlight},stroke-dasharray:0 !important;
            linkStyle 6 stroke:${DIAGRAM_STYLES.colors.default},stroke-width:${DIAGRAM_STYLES.strokeWidths.highlight},stroke-dasharray:0 !important;
            `;
        case 'did':
          return `
          graph LR
            Issuer[<img src="/identus-logo.svg" height="20" style="vertical-align:middle" alt="Issuer"/> Issuer] -- "<b>Issuer PrismDID</b><br>Create DID<br>Publish onChain" --> Blockchain[<img src="/cardano-ada-logo.webp" height="20" style="vertical-align:middle" alt="Blockchain"/> Cardano Blockchain]
            Issuer -- "<b>Credential Offer</b><br>Create Offer<br>Share OOB/QRCode" --> Holder[<img src="/lace.svg" height="20" style="vertical-align:middle" alt="Holder"/> Holder]
            Holder -- "<b>Credential Request</b><br>Review Offer<br>Send Request" --> Issuer
            Issuer -- "<b>Creential Issuance</b><br>Approve Request<br>Issue Credential" --> Holder

            style Issuer fill:none,stroke:${DIAGRAM_STYLES.colors.primary},stroke-width:${DIAGRAM_STYLES.strokeWidths.active}
            style Blockchain fill:none,stroke:${DIAGRAM_STYLES.colors.primary},stroke-width:${DIAGRAM_STYLES.strokeWidths.active},color:${DIAGRAM_STYLES.colors.text}
            style Holder fill:none,stroke:${DIAGRAM_STYLES.colors.default},stroke-width:${DIAGRAM_STYLES.strokeWidths.default}
            linkStyle 0 stroke:${DIAGRAM_STYLES.colors.primary},stroke-width:${DIAGRAM_STYLES.strokeWidths.highlight}
            linkStyle 1 stroke:${DIAGRAM_STYLES.colors.default},stroke-width:${DIAGRAM_STYLES.strokeWidths.highlight},stroke-dasharray:0 !important;
            linkStyle 2 stroke:${DIAGRAM_STYLES.colors.default},stroke-width:${DIAGRAM_STYLES.strokeWidths.highlight},stroke-dasharray:0 !important;
            linkStyle 3 stroke:${DIAGRAM_STYLES.colors.default},stroke-width:${DIAGRAM_STYLES.strokeWidths.highlight},stroke-dasharray:0 !important;
          `;
        case 'oobIssuer':
          return `
          graph LR
            Issuer[<img src="/identus-logo.svg" height="20" style="vertical-align:middle" alt="Issuer"/> Issuer] -- "<b>Issuer PrismDID</b><br>Create DID<br>Publish onChain" --> Blockchain[<img src="/cardano-ada-logo.webp" height="20" style="vertical-align:middle" alt="Blockchain"/> Cardano Blockchain]
            Issuer -- "<b>Credential Offer</b><br>Create Offer<br>Share OOB/QRCode" --> Holder[<img src="/lace.svg" height="20" style="vertical-align:middle" alt="Holder"/> Holder]
            Holder -- "<b>Credential Request</b><br>Review Offer<br>Send Request" --> Issuer
            Issuer -- "<b>Creential Issuance</b><br>Approve Request<br>Issue Credential" --> Holder

            style Issuer fill:none,stroke:${DIAGRAM_STYLES.colors.primary},stroke-width:${DIAGRAM_STYLES.strokeWidths.active}
            style Blockchain fill:none,stroke:${DIAGRAM_STYLES.colors.success},stroke-width:${DIAGRAM_STYLES.strokeWidths.active}
            style Holder fill:none,stroke:${DIAGRAM_STYLES.colors.primary},stroke-width:${DIAGRAM_STYLES.strokeWidths.active}

            linkStyle 0 stroke:${DIAGRAM_STYLES.colors.success},stroke-width:${DIAGRAM_STYLES.strokeWidths.highlight},stroke-dasharray:0 !important;
            linkStyle 1 stroke:${DIAGRAM_STYLES.colors.primary},stroke-width:${DIAGRAM_STYLES.strokeWidths.activeLink}
            linkStyle 2 stroke:${DIAGRAM_STYLES.colors.default},stroke-width:${DIAGRAM_STYLES.strokeWidths.highlight},stroke-dasharray:0 !important;
            linkStyle 3 stroke:${DIAGRAM_STYLES.colors.default},stroke-width:${DIAGRAM_STYLES.strokeWidths.highlight},stroke-dasharray:0 !important;
          `;
        case 'oobHolder':
          return `
          graph LR
            Issuer[<img src="/identus-logo.svg" height="20" style="vertical-align:middle" alt="Issuer"/> Issuer] -- "<b>Issuer PrismDID</b><br>Create DID<br>Publish onChain" --> Blockchain[<img src="/cardano-ada-logo.webp" height="20" style="vertical-align:middle" alt="Blockchain"/> Cardano Blockchain]
            Issuer -- "<b>Credential Offer</b><br>Create Offer<br>Share OOB/QRCode" --> Holder[<img src="/lace.svg" height="20" style="vertical-align:middle" alt="Holder"/> Holder]
            Holder -- "<b>Credential Request</b><br>Review Offer<br>Send Request" --> Issuer
            Issuer -- "<b>Creential Issuance</b><br>Approve Request<br>Issue Credential" --> Holder

            style Issuer fill:none,stroke:${DIAGRAM_STYLES.colors.primary},stroke-width:${DIAGRAM_STYLES.strokeWidths.active}
            style Blockchain fill:none,stroke:${DIAGRAM_STYLES.colors.success},stroke-width:${DIAGRAM_STYLES.strokeWidths.active}
            style Holder fill:none,stroke:${DIAGRAM_STYLES.colors.primary},stroke-width:${DIAGRAM_STYLES.strokeWidths.active}

            linkStyle 0 stroke:${DIAGRAM_STYLES.colors.success},stroke-width:${DIAGRAM_STYLES.strokeWidths.highlight},stroke-dasharray:0 !important;
            linkStyle 1 stroke:${DIAGRAM_STYLES.colors.success},stroke-width:${DIAGRAM_STYLES.strokeWidths.highlight},stroke-dasharray:0 !important;
            linkStyle 2 stroke:${DIAGRAM_STYLES.colors.primary},stroke-width:${DIAGRAM_STYLES.strokeWidths.activeLink}
            linkStyle 3 stroke:${DIAGRAM_STYLES.colors.default},stroke-width:${DIAGRAM_STYLES.strokeWidths.highlight},stroke-dasharray:0 !important;

          `;
        case 'issuance':
          return `
          graph LR
            Issuer[<img src="/identus-logo.svg" height="20" style="vertical-align:middle" alt="Issuer"/> Issuer] -- "<b>Issuer PrismDID</b><br>Create DID<br>Publish onChain" --> Blockchain[<img src="/cardano-ada-logo.webp" height="20" style="vertical-align:middle" alt="Blockchain"/> Cardano Blockchain]
            Issuer -- "<b>Credential Offer</b><br>Create Offer<br>Share OOB/QRCode" --> Holder[<img src="/lace.svg" height="20" style="vertical-align:middle" alt="Holder"/> Holder]
            Holder -- "<b>Credential Request</b><br>Review Offer<br>Send Request" --> Issuer
            Issuer -- "<b>Creential Issuance</b><br>Approve Request<br>Issue Credential" --> Holder

            style Issuer fill:none,stroke:${DIAGRAM_STYLES.colors.primary},stroke-width:${DIAGRAM_STYLES.strokeWidths.active}
            style Blockchain fill:none,stroke:${DIAGRAM_STYLES.colors.success},stroke-width:${DIAGRAM_STYLES.strokeWidths.active}
            style Holder fill:none,stroke:${DIAGRAM_STYLES.colors.primary},stroke-width:${DIAGRAM_STYLES.strokeWidths.active}

            linkStyle 0 stroke:${DIAGRAM_STYLES.colors.success},stroke-width:${DIAGRAM_STYLES.strokeWidths.highlight},stroke-dasharray:0 !important;
            linkStyle 1 stroke:${DIAGRAM_STYLES.colors.success},stroke-width:${DIAGRAM_STYLES.strokeWidths.highlight},stroke-dasharray:0 !important;
            linkStyle 2 stroke:${DIAGRAM_STYLES.colors.success},stroke-width:${DIAGRAM_STYLES.strokeWidths.highlight},stroke-dasharray:0 !important;
            linkStyle 3 stroke:${DIAGRAM_STYLES.colors.primary},stroke-width:${DIAGRAM_STYLES.strokeWidths.highlight}


          `;
        case 'credentials':
          return `
          graph LR
            Issuer[<img src="/identus-logo.svg" height="20" style="vertical-align:middle" alt="Issuer"/> Issuer] -- "<b>Issuer PrismDID</b><br>Create DID<br>Publish onChain" --> Blockchain[<img src="/cardano-ada-logo.webp" height="20" style="vertical-align:middle" alt="Blockchain"/> Cardano Blockchain]
            Issuer -- "<b>Credential Offer</b><br>Create Offer<br>Share OOB/QRCode" --> Holder[<img src="/lace.svg" height="20" style="vertical-align:middle" alt="Holder"/> Holder]
            Holder -- "<b>Credential Request</b><br>Review Offer<br>Send Request" --> Issuer
            Issuer -- "<b>Creential Issuance</b><br>Approve Request<br>Issue Credential" --> Holder

            style Issuer fill:none,stroke:${DIAGRAM_STYLES.colors.success},stroke-width:${DIAGRAM_STYLES.strokeWidths.active}
            style Blockchain fill:none,stroke:${DIAGRAM_STYLES.colors.success},stroke-width:${DIAGRAM_STYLES.strokeWidths.active}
            style Holder fill:none,stroke:${DIAGRAM_STYLES.colors.success},stroke-width:${DIAGRAM_STYLES.strokeWidths.active}


            linkStyle 0 stroke:${DIAGRAM_STYLES.colors.success},stroke-width:${DIAGRAM_STYLES.strokeWidths.highlight},stroke-dasharray:0 !important;
            linkStyle 1 stroke:${DIAGRAM_STYLES.colors.success},stroke-width:${DIAGRAM_STYLES.strokeWidths.highlight},stroke-dasharray:0 !important;
            linkStyle 2 stroke:${DIAGRAM_STYLES.colors.success},stroke-width:${DIAGRAM_STYLES.strokeWidths.highlight},stroke-dasharray:0 !important;
            linkStyle 3 stroke:${DIAGRAM_STYLES.colors.success},stroke-width:${DIAGRAM_STYLES.strokeWidths.highlight},stroke-dasharray:0 !important;
          `;
        case 'presentationRequest':
          return `
          graph LR
            Verifier[<img src="/identus-logo.svg" height="20" style="vertical-align:middle" alt="Verifier"/> Verifier] -- "<b>Presentation Request</b><br>Create Request<br>Share OOB/QRCode" --> Holder[<img src="/lace.svg" height="20" style="vertical-align:middle" alt="Holder"/> Holder]
            Holder -- "<b>Verifiable Presentation</b><br>Choose credential<br>Send Presentation" --> Verifier
            Verifier -- "<b>Verify credential</b><br>Resolve Issuer DID<br>Verify signatures + proofs" --> Blockchain[<img src="/cardano-ada-logo.webp" height="20" style="vertical-align:middle" alt="Blockchain"/> Cardano Blockchain]

            style Verifier fill:none,stroke:${DIAGRAM_STYLES.colors.primary},stroke-width:${DIAGRAM_STYLES.strokeWidths.active},color:${DIAGRAM_STYLES.colors.text}
            style Holder fill:none,stroke:${DIAGRAM_STYLES.colors.primary},stroke-width:${DIAGRAM_STYLES.strokeWidths.active}
            style Blockchain fill:none,stroke:${DIAGRAM_STYLES.colors.default},stroke-width:${DIAGRAM_STYLES.strokeWidths.default},color:${DIAGRAM_STYLES.colors.text}

            linkStyle 0 stroke:${DIAGRAM_STYLES.colors.primary},stroke-width:${DIAGRAM_STYLES.strokeWidths.activeLink}
            linkStyle 1 stroke:${DIAGRAM_STYLES.colors.default},stroke-width:${DIAGRAM_STYLES.strokeWidths.default},stroke-dasharray:0 !important;
            linkStyle 2 stroke:${DIAGRAM_STYLES.colors.default},stroke-width:${DIAGRAM_STYLES.strokeWidths.default},stroke-dasharray:0 !important;
          `;
        case 'present':
          return `
          graph LR
            Verifier[<img src="/identus-logo.svg" height="20" style="vertical-align:middle" alt="Verifier"/> Verifier] -- "<b>Presentation Request</b><br>Create Request<br>Share OOB/QRCode" --> Holder[<img src="/lace.svg" height="20" style="vertical-align:middle" alt="Holder"/> Holder]
            Holder -- "<b>Verifiable Presentation</b><br>Choose credential<br>Send Presentation" --> Verifier
            Verifier -- "<b>Verify credential</b><br>Resolve Issuer DID<br>Verify signatures + proofs" --> Blockchain[<img src="/cardano-ada-logo.webp" height="20" style="vertical-align:middle" alt="Blockchain"/> Cardano Blockchain]

            style Verifier fill:none,stroke:${DIAGRAM_STYLES.colors.primary},stroke-width:${DIAGRAM_STYLES.strokeWidths.active},color:${DIAGRAM_STYLES.colors.text}
            style Holder fill:none,stroke:${DIAGRAM_STYLES.colors.primary},stroke-width:${DIAGRAM_STYLES.strokeWidths.active}
            style Blockchain fill:none,stroke:${DIAGRAM_STYLES.colors.default},stroke-width:${DIAGRAM_STYLES.strokeWidths.default},color:${DIAGRAM_STYLES.colors.text}

            linkStyle 0 stroke:${DIAGRAM_STYLES.colors.success},stroke-width:${DIAGRAM_STYLES.strokeWidths.highlight},stroke-dasharray:0 !important;
            linkStyle 1 stroke:${DIAGRAM_STYLES.colors.primary},stroke-width:${DIAGRAM_STYLES.strokeWidths.activeLink}
            linkStyle 2 stroke:${DIAGRAM_STYLES.colors.default},stroke-width:${DIAGRAM_STYLES.strokeWidths.default},stroke-dasharray:0 !important;
          `;
        case 'presentationVerify':
          return `
          graph LR
            Verifier[<img src="/identus-logo.svg" height="20" style="vertical-align:middle" alt="Verifier"/> Verifier] -- "<b>Presentation Request</b><br>Create Request<br>Share OOB/QRCode" --> Holder[<img src="/lace.svg" height="20" style="vertical-align:middle" alt="Holder"/> Holder]
            Holder -- "<b>Verifiable Presentation</b><br>Choose credential<br>Send Presentation" --> Verifier
            Verifier -- "<b>Verify credential</b><br>Resolve Issuer DID<br>Verify signatures + proofs" --> Blockchain[<img src="/cardano-ada-logo.webp" height="20" style="vertical-align:middle" alt="Blockchain"/> Cardano Blockchain]

            style Verifier fill:none,stroke:${DIAGRAM_STYLES.colors.primary},stroke-width:${DIAGRAM_STYLES.strokeWidths.active},color:${DIAGRAM_STYLES.colors.text}
            style Holder fill:none,stroke:${DIAGRAM_STYLES.colors.success},stroke-width:${DIAGRAM_STYLES.strokeWidths.active}
            style Blockchain fill:none,stroke:${DIAGRAM_STYLES.colors.primary},stroke-width:${DIAGRAM_STYLES.strokeWidths.active},color:${DIAGRAM_STYLES.colors.text}

            linkStyle 0 stroke:${DIAGRAM_STYLES.colors.success},stroke-width:${DIAGRAM_STYLES.strokeWidths.highlight},stroke-dasharray:0 !important;
            linkStyle 1 stroke:${DIAGRAM_STYLES.colors.success},stroke-width:${DIAGRAM_STYLES.strokeWidths.highlight},stroke-dasharray:0 !important;
            linkStyle 2 stroke:${DIAGRAM_STYLES.colors.primary},stroke-width:${DIAGRAM_STYLES.strokeWidths.activeLink}
          `;
        default:
          return '';
      }
    };

    if (mermaidRef.current) {
      const renderDiagram = async () => {
        const diagram = getDiagram(stepType);
        if (diagram) {
          // Clear existing content
          mermaidRef.current!.innerHTML = '';

          // Generate unique ID for this diagram
          const diagramId = `mermaid-${stepType}-${Date.now()}`;

          try {
            // Render the new diagram
            const { svg } = await mermaid.render(diagramId, diagram);
            mermaidRef.current!.innerHTML = svg;

            // Ensure SVG fills the container width
            const svgElement = mermaidRef.current!.querySelector('svg');
            if (svgElement) {
              svgElement.style.width = '100%';
              svgElement.style.height = 'auto';
              svgElement.removeAttribute('width');
              svgElement.removeAttribute('height');
            }
          } catch (error) {
            console.error('Error rendering mermaid diagram:', error);
            // Fallback: set innerHTML directly and let mermaid process it
            mermaidRef.current!.innerHTML = diagram;
            mermaid.contentLoaded();

            // Apply the same SVG styling for fallback
            setTimeout(() => {
              const svgElement = mermaidRef.current!.querySelector('svg');
              if (svgElement) {
                svgElement.style.width = '100%';
                svgElement.style.height = 'auto';
                svgElement.removeAttribute('width');
                svgElement.removeAttribute('height');
              }
            }, 100);
          }
        }
      };

      renderDiagram();
    }
  }, [stepType]);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 mb-12 w-full">
      <div
        className="mermaid w-full mb-8"
        ref={mermaidRef}
        style={{
          width: '100%',
          overflow: 'hidden'
        }}
      >
      </div>
    </div>
  );
};

export default Flowchart;
