export function StarLogo({ size = 52 }: { size?: number }) {
  return (
    <div className="relative flex items-center justify-center p-4">
      {/* star extracted from PluginLogo */}
      <svg
        width={size}
        height={size}
        viewBox="12 11 14 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative text-foreground drop-shadow-[0_0_6px_rgba(255,255,255,0.6)]"
      >
        <path
          d="M18.7175 12.2401L17.8554 18.023L13.3094 21.6648C13.2542 21.7961 13.2095 21.9317 13.1758 22.0703C13.3103 22.1166 13.45 22.1458 13.5917 22.157L18.9991 20.0159L24.4086 22.1599C24.55 22.1487 24.6895 22.1195 24.8238 22.0732C24.7962 21.933 24.7516 21.7968 24.6909 21.6677L20.1442 18.0245L19.2821 12.2416C19.2016 12.1228 19.1065 12.0147 18.9991 11.9199C18.8926 12.0147 18.798 12.1223 18.7175 12.2401Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}
