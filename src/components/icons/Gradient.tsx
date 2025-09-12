export const Gradient = ({className}) => {

  return (
      <defs>
        <linearGradient id="globalGradient" gradientUnits="userSpaceOnUse" x1="23.0064" y1="0.7216" x2="24.8325" y2="43.5042">
          {className.includes('dark') ? (
            <>
              <stop offset="0" style={{ stopColor: '#f06425', stopOpacity: 1 }} />
              <stop offset="1" style={{ stopColor: '#d9dcdd', stopOpacity: 1 }} />
            </>
          ) : (
            <>
              <stop offset="0" style={{ stopColor: '#f06425', stopOpacity: 1 }} />
              <stop offset="1" style={{ stopColor: '#0e1215', stopOpacity: 1 }} />
            </>
          )}
        </linearGradient>
      </defs>
  );
};