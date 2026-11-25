import type { Metadata } from "next";
import "./globals.css";
export const metadata:Metadata={title:"SmartAgri | Grow with confidence",description:"A practical farm workspace for crops, activities, local weather and growing guidance."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
