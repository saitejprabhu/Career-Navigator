import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex gap-4 p-4 bg-gray-100">
      <Link href="/">Home</Link>
      <Link href="/profile">Profile</Link>
      <Link href="/career-map">Career Map</Link>
      <Link href="/careers">Careers</Link>
      <Link href="/login">Login</Link>
    </nav>
  );
}
