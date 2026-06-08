"use client";

import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function LocalhostPortLauncher() {
	const [visible, setVisible] = useState(false);
	const [port, setPort] = useState<string | null>(() => localStorage.getItem("port"));
	const inputRef = useRef<HTMLInputElement | null>(null);

	function updatePort(e: ChangeEvent<HTMLInputElement>) {
		const value = e.target.value;

		if (!value) {
			setPort(null);
			localStorage.removeItem("port");
			return;
		}

		if (/^(?:[1-9]\d{0,3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/.test(value)) {
			setPort(value);
			localStorage.setItem("port", value);
		}
	}

	// ⌨️ CTRL + L shortcut
	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (e.ctrlKey && e.key.toLowerCase() === "l") {
				e.preventDefault();
				setVisible(true);
			}
		};

		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, []);

	useEffect(() => {
		if (visible) {
			setTimeout(() => {
				inputRef.current?.focus();
				inputRef.current?.select();
			}, 100);
		}
	}, [visible]);

	function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
		if (e.key === "Enter" && port) {
			localStorage.setItem("port", port);
			setVisible(false);
			window.open(`http://localhost:${port}/`, "_blank");
		}
	}

	return (
		<Dialog open={visible} onOpenChange={setVisible}>
			<DialogContent className="w-[25rem]">
				<DialogHeader>
					<DialogTitle>Open Localhost:Port</DialogTitle>
				</DialogHeader>
				<div className="flex flex-col gap-1 text-white font-semibold justify-center">
					<input ref={inputRef} type="text" placeholder="Enter port number" value={port ?? ""} onChange={updatePort} onKeyDown={onKeyDown} className="w-full bg-background text-white font-semibold px-2 py-1 rounded-lg outline-none border-2" />
					<p className="text-xs px-1">
						Press <b>Enter</b> to open
					</p>
				</div>
			</DialogContent>
		</Dialog>
	);
}
