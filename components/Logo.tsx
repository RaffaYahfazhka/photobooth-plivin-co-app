import { Krona_One } from "next/font/google";

const kronaOne = Krona_One({
  weight: "400",
  subsets: ["latin"],
});

export function Logo({ className = "size-8 text-lg" }: { className?: string }) {
  return (
    <div
      className={`bg-white text-black flex items-center justify-center rounded-md font-bold shadow-sm border border-black dark:border-white ${kronaOne.className} ${className}`}
    >
      P
    </div>
  );
}

export function LogoText({ className = "text-2xl" }: { className?: string }) {
  return (
    <span className={`font-bold lowercase tracking-tight ${kronaOne.className} ${className}`}>
      plivin.co
    </span>
  );
}
