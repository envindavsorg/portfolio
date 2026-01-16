'use client';

import { AppleHelloEffect } from '@/registry/apple-hello-effect';

const AppleHelloEffectDemo = () => (
	<div className="flex min-h-64 items-center justify-center">
		<AppleHelloEffect className="text-foreground" speed={0.8} />
	</div>
);

export default AppleHelloEffectDemo;
