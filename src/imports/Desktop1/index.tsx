function Component({ className }: { className?: string }) {
  return (
    <div className={className || "h-[496px] relative w-[796px]"} data-name="Component 1">
      <div className="absolute border border-[#707070] border-solid inset-[7.06%_0]" />
      <div className="absolute bottom-0 flex items-center justify-center left-0 right-full top-[92.94%]" style={{ containerType: "size" }}>
        <div className="flex-none h-[65363800cqw] rotate-90 w-[100cqh]">
          <div className="relative size-full">
            <div className="absolute inset-[-1px_0_0_0]">
              <svg className="block size-full" fill="none" height="1" preserveAspectRatio="none" viewBox="0 0 35 1" width="35">
                <line id="Line 1" stroke="#707070" x2="35" y1="0.5" y2="0.5" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute flex inset-[92.94%_0.13%_0_99.87%] items-center justify-center" style={{ containerType: "size" }}>
        <div className="flex-none h-[65363800cqw] rotate-90 w-[100cqh]">
          <div className="relative size-full">
            <div className="absolute inset-[-1px_0_0_0]">
              <svg className="block size-full" fill="none" height="1" preserveAspectRatio="none" viewBox="0 0 35 1" width="35">
                <line id="Line 1" stroke="#707070" x2="35" y1="0.5" y2="0.5" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-[92.94%] flex items-center justify-center left-0 right-full top-0" style={{ containerType: "size" }}>
        <div className="flex-none h-[65363800cqw] rotate-90 w-[100cqh]">
          <div className="relative size-full">
            <div className="absolute inset-[-1px_0_0_0]">
              <svg className="block size-full" fill="none" height="1" preserveAspectRatio="none" viewBox="0 0 35 1" width="35">
                <line id="Line 1" stroke="#707070" x2="35" y1="0.5" y2="0.5" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute flex inset-[0_0.13%_92.94%_99.87%] items-center justify-center" style={{ containerType: "size" }}>
        <div className="flex-none h-[65363800cqw] rotate-90 w-[100cqh]">
          <div className="relative size-full">
            <div className="absolute inset-[-1px_0_0_0]">
              <svg className="block size-full" fill="none" height="1" preserveAspectRatio="none" viewBox="0 0 35 1" width="35">
                <line id="Line 1" stroke="#707070" x2="35" y1="0.5" y2="0.5" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bg-[#e3f5b8] bottom-[35.28%] left-[30.03%] right-[30.15%] rounded-[6px] top-1/2" />
      <div className="absolute bg-[#e3f5b8] inset-[70.97%_30.21%_14.31%_29.96%] rounded-[6px]" />
      <div className="absolute border border-[#d3d8c7] border-solid inset-[69.76%_29.33%_13.1%_29.21%] rounded-[6px]" />
      <div className="[word-break:break-word] absolute font-['Space_Grotesk:Bold',sans-serif] font-bold inset-[17.54%_16.21%_49.8%_19.6%] leading-[0] text-[#3f472c] text-[0px] text-center">
        <p className="leading-[50px] mb-0 text-[51px]">Want to know more about me?</p>
        <p className="leading-[50px] text-[18px]">Here is my resume!</p>
      </div>
      <p className="[word-break:break-word] absolute font-['Space_Grotesk:Bold',sans-serif] font-bold inset-[53.02%_24.37%_38.31%_25.38%] leading-[normal] text-[#3f472c] text-[28px] text-center">View here</p>
      <p className="[word-break:break-word] absolute font-['Space_Grotesk:Bold',sans-serif] font-bold inset-[73.99%_23.87%_17.34%_25.88%] leading-[normal] text-[#3f472c] text-[28px] text-center">Download</p>
      <div className="absolute border border-[#d3d8c7] border-solid inset-[48.79%_29.27%_34.07%_29.27%] rounded-[6px]" />
    </div>
  );
}

export default function Desktop() {
  return (
    <div className="bg-white content-stretch flex flex-col items-start px-[19px] relative size-full" data-name="Desktop - 1">
      <Component className="h-[496px] relative shrink-0 w-[796px]" />
    </div>
  );
}