import { motion, AnimatePresence } from "framer-motion";
import { BrandMark } from "./BrandMark";
interface GlobalLoaderProps {
	message?: string;
}
export function GlobalLoader({ message = "Preparing your space…" }: GlobalLoaderProps) {
	return (
		<AnimatePresence>
			<motion.div
				initial={{
					opacity: 0,
				}}
				animate={{
					opacity: 1,
				}}
				exit={{
					opacity: 0,
				}}
				transition={{
					duration: 0.4,
					ease: [0.16, 1, 0.3, 1],
				}}
				className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
				role="status"
				aria-live="polite"
				aria-label="Loading"
			>
				{/* Ambient glows to match auth shell */}
				<div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-rose-300/[0.06] blur-[120px] pointer-events-none" />
				<div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/[0.03] blur-[120px] pointer-events-none" />

				<motion.div
					initial={{
						y: 8,
						opacity: 0,
					}}
					animate={{
						y: 0,
						opacity: 1,
					}}
					exit={{
						y: -4,
						opacity: 0,
					}}
					transition={{
						duration: 0.5,
						delay: 0.05,
						ease: [0.16, 1, 0.3, 1],
					}}
					className="relative flex flex-col items-center gap-8"
				>
					{/* Brand mark above spinner */}
					<BrandMark />

					{/* Elegant dual-ring spinner */}
					<div className="relative w-14 h-14 flex items-center justify-center">
						{/* Outer subtle track */}
						<div className="absolute inset-0 rounded-full border border-white/[0.06]" />

						{/* Rotating gradient ring */}
						<motion.div
							className="absolute inset-0 rounded-full"
							style={{
								background: "conic-gradient(from 0deg, transparent 0deg, transparent 270deg, #fda4af 360deg)",
								WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 2px))",
								mask: "radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 2px))",
							}}
							animate={{
								rotate: 360,
							}}
							transition={{
								duration: 1.1,
								repeat: Infinity,
								ease: "linear",
							}}
						/>

						{/* Inner pulsing dot */}
						<motion.div
							className="w-1.5 h-1.5 rounded-full bg-rose-300"
							animate={{
								scale: [1, 1.4, 1],
								opacity: [0.7, 1, 0.7],
							}}
							transition={{
								duration: 1.6,
								repeat: Infinity,
								ease: "easeInOut",
							}}
						/>

						{/* Soft glow behind spinner */}
						<div className="absolute inset-0 rounded-full bg-rose-300/10 blur-xl -z-10" />
					</div>

					{/* Loading message */}
					<motion.p
						key={message}
						initial={{
							opacity: 0,
							y: 4,
						}}
						animate={{
							opacity: 1,
							y: 0,
						}}
						transition={{
							duration: 0.4,
							delay: 0.1,
						}}
						className="text-sm text-neutral-400 font-medium tracking-tight"
					>
						{message}
					</motion.p>
				</motion.div>

				{/* Version tag bottom corner */}
				<div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-mono text-neutral-600 tracking-wider">v0.1.0-beta</div>
			</motion.div>
		</AnimatePresence>
	);
}
