import Image from "next/image";
import Link from "next/link";

export default function Logo({ size = 40, linkTo = "/", className = "" }) {
  return (
    <Link href={linkTo} className={`inline-block ${className}`}>
      <Image
        src="https://res.cloudinary.com/mhk-cloud/image/upload/v1784489938/Portfolio_website_logo_e1ooep.png"
        alt="{SA} Shafique Ahmed Logo"
        width={size}
        height={size}
        className="rounded-lg"
        priority
      />
    </Link>
  );
}