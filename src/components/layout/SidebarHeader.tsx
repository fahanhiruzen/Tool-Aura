import { Minimize2 } from "lucide-react";
import { sendPluginResize } from "@/lib/figma-plugin";
import { usePluginStore } from "@/stores";
import { Button } from "@/components/ui/button";

function ToolHubLogo() {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-foreground/5">
      <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
<g filter="url(#filter0_dddi_6328_39822)">
<g clip-path="url(#clip0_6328_39822)">
<path d="M3 14.8C3 10.3196 3 8.07937 3.87195 6.36808C4.63893 4.86278 5.86278 3.63893 7.36808 2.87195C9.07937 2 11.3196 2 15.8 2H22.2C26.6804 2 28.9206 2 30.6319 2.87195C32.1372 3.63893 33.3611 4.86278 34.1281 6.36808C35 8.07937 35 10.3196 35 14.8V21.2C35 25.6804 35 27.9206 34.1281 29.6319C33.3611 31.1372 32.1372 32.3611 30.6319 33.1281C28.9206 34 26.6804 34 22.2 34H15.8C11.3196 34 9.07937 34 7.36808 33.1281C5.86278 32.3611 4.63893 31.1372 3.87195 29.6319C3 27.9206 3 25.6804 3 21.2V14.8Z" fill="white"/>
<path d="M3 14.8C3 10.3196 3 8.07937 3.87195 6.36808C4.63893 4.86278 5.86278 3.63893 7.36808 2.87195C9.07937 2 11.3196 2 15.8 2H22.2C26.6804 2 28.9206 2 30.6319 2.87195C32.1372 3.63893 33.3611 4.86278 34.1281 6.36808C35 8.07937 35 10.3196 35 14.8V21.2C35 25.6804 35 27.9206 34.1281 29.6319C33.3611 31.1372 32.1372 32.3611 30.6319 33.1281C28.9206 34 26.6804 34 22.2 34H15.8C11.3196 34 9.07937 34 7.36808 33.1281C5.86278 32.3611 4.63893 31.1372 3.87195 29.6319C3 27.9206 3 25.6804 3 21.2V14.8Z" fill="url(#paint0_linear_6328_39822)" fill-opacity="0.2"/>
<rect x="3" y="2" width="32" height="32" rx="2" fill="#1D2939"/>
<path opacity="0.3" d="M12.4268 10.96H10.2021V24.0664H12.4268V25.251H8.84766V9.77441H12.4268V10.96ZM29.1113 25.251H25.5332V24.0664H27.7578V10.96H25.5332V9.77441H29.1113V25.251Z" fill="white"/>
<path d="M18.7175 12.2401L17.8554 18.023L13.3094 21.6648C13.2542 21.7961 13.2095 21.9317 13.1758 22.0703C13.3103 22.1166 13.45 22.1458 13.5917 22.157L18.9991 20.0159L24.4086 22.1599C24.55 22.1487 24.6895 22.1195 24.8238 22.0732C24.7962 21.933 24.7516 21.7968 24.6909 21.6677L20.1442 18.0245L19.2821 12.2416C19.2016 12.1228 19.1065 12.0147 18.9991 11.9199C18.8926 12.0147 18.798 12.1223 18.7175 12.2401Z" fill="white"/>
</g>
<path d="M15.7998 2.09961H22.2002C24.442 2.09961 26.1173 2.1004 27.4463 2.20898C28.7741 2.31747 29.7477 2.53335 30.5869 2.96094C32.0732 3.7183 33.2817 4.92681 34.0391 6.41309C34.4666 7.25227 34.6825 8.22592 34.791 9.55371C34.8996 10.8827 34.9004 12.558 34.9004 14.7998V21.2002C34.9004 23.442 34.8996 25.1173 34.791 26.4463C34.6825 27.7741 34.4666 28.7477 34.0391 29.5869C33.2817 31.0732 32.0732 32.2817 30.5869 33.0391C29.7477 33.4666 28.7741 33.6825 27.4463 33.791C26.1173 33.8996 24.442 33.9004 22.2002 33.9004H15.7998C13.558 33.9004 11.8827 33.8996 10.5537 33.791C9.22592 33.6825 8.25227 33.4666 7.41309 33.0391C5.92681 32.2817 4.7183 31.0732 3.96094 29.5869C3.53335 28.7477 3.31747 27.7741 3.20898 26.4463C3.1004 25.1173 3.09961 23.442 3.09961 21.2002V14.7998C3.09961 12.558 3.1004 10.8827 3.20898 9.55371C3.31747 8.22592 3.53335 7.25227 3.96094 6.41309C4.7183 4.92681 5.92681 3.7183 7.41309 2.96094C8.25227 2.53335 9.22592 2.31747 10.5537 2.20898C11.8827 2.1004 13.558 2.09961 15.7998 2.09961Z" stroke="#0A0D12" stroke-opacity="0.12" stroke-width="0.2"/>
</g>
<defs>
<filter id="filter0_dddi_6328_39822" x="0" y="0" width="38" height="38" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="1"/>
<feGaussianBlur stdDeviation="1"/>
<feColorMatrix type="matrix" values="0 0 0 0 0.0392157 0 0 0 0 0.0509804 0 0 0 0 0.0705882 0 0 0 0.06 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_6328_39822"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="1"/>
<feGaussianBlur stdDeviation="1.5"/>
<feColorMatrix type="matrix" values="0 0 0 0 0.0392157 0 0 0 0 0.0509804 0 0 0 0 0.0705882 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="effect1_dropShadow_6328_39822" result="effect2_dropShadow_6328_39822"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feMorphology radius="0.5" operator="erode" in="SourceAlpha" result="effect3_dropShadow_6328_39822"/>
<feOffset dy="1"/>
<feGaussianBlur stdDeviation="0.5"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0.0392157 0 0 0 0 0.0509804 0 0 0 0 0.0705882 0 0 0 0.13 0"/>
<feBlend mode="normal" in2="effect2_dropShadow_6328_39822" result="effect3_dropShadow_6328_39822"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect3_dropShadow_6328_39822" result="shape"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="-0.5"/>
<feGaussianBlur stdDeviation="0.25"/>
<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
<feColorMatrix type="matrix" values="0 0 0 0 0.0392157 0 0 0 0 0.0509804 0 0 0 0 0.0705882 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="shape" result="effect4_innerShadow_6328_39822"/>
</filter>
<linearGradient id="paint0_linear_6328_39822" x1="19" y1="2" x2="19" y2="34" gradientUnits="userSpaceOnUse">
<stop stop-color="white"/>
<stop offset="1" stop-color="#0A0D12"/>
</linearGradient>
<clipPath id="clip0_6328_39822">
<path d="M3 14.8C3 10.3196 3 8.07937 3.87195 6.36808C4.63893 4.86278 5.86278 3.63893 7.36808 2.87195C9.07937 2 11.3196 2 15.8 2H22.2C26.6804 2 28.9206 2 30.6319 2.87195C32.1372 3.63893 33.3611 4.86278 34.1281 6.36808C35 8.07937 35 10.3196 35 14.8V21.2C35 25.6804 35 27.9206 34.1281 29.6319C33.3611 31.1372 32.1372 32.3611 30.6319 33.1281C28.9206 34 26.6804 34 22.2 34H15.8C11.3196 34 9.07937 34 7.36808 33.1281C5.86278 32.3611 4.63893 31.1372 3.87195 29.6319C3 27.9206 3 25.6804 3 21.2V14.8Z" fill="white"/>
</clipPath>
</defs>
</svg>

    </div>
  );
}

export function SidebarHeader() {
  const setMinimized = usePluginStore((s) => s.setMinimized);
  const handleMinimize = () => {
    setMinimized(true);
    sendPluginResize("minimize");
  };
  return (
    <div className="flex h-14 shrink-0 items-center justify-between gap-3 border-b px-4">
      <div className="flex items-center gap-3">
        <ToolHubLogo />
        <span className="text-lg font-semibold text-foreground">ToolHub</span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0"
        onClick={handleMinimize}
        title="Minimise"
      >
        <Minimize2 className="size-4" />
      </Button>
    </div>
  );
}
