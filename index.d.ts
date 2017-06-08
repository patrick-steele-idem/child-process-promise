/// <reference types="node"/>

declare module "child-process-promise" {
	import {
		ChildProcess,
		ExecFileOptions,
		ExecFileOptionsWithBufferEncoding,
		ExecFileOptionsWithStringEncoding,
		ExecOptions,
		ExecOptionsWithBufferEncoding,
		ExecOptionsWithStringEncoding,
		ForkOptions,
		SpawnOptions,
	} from "child_process";
	
	export interface ChildProcessPromise<StreamType extends string
		|Buffer> extends Promise<ChildProcessResult<StreamType>> {
		progress(callback: (cp: ChildProcess) => void): this;
	}
	
	export interface ChildProcessResult<StreamType extends string|Buffer> {
		childProcess: ChildProcess;
		stdout: StreamType;
		stderr: StreamType;
	}
	
	export interface ExtendOption {
		capture?: ('stderr'|'stdout')[];
		successfulExitCodes?: number[];
	}
	
	export interface ChildProcessError extends Error {
		code: number;
		childProcess: ChildProcess;
		stdout: Buffer|string;
		stderr: Buffer|string;
	}
	
	export function spawn(command: string, args?: string[],
		options?: SpawnOptions&ExtendOption): ChildProcessPromise<string>;
	
	export function exec(command: string): ChildProcessPromise<string>;
	export function exec(command: string, options: ExecOptionsWithStringEncoding): ChildProcessPromise<string>;
	export function exec(command: string, options: ExecOptionsWithBufferEncoding): ChildProcessPromise<Buffer>;
	export function exec(command: string, options: ExecOptions): ChildProcessPromise<string>;
	
	export function execFile(file: string): ChildProcessPromise<string>;
	export function execFile(file: string, options?: ExecFileOptionsWithStringEncoding): ChildProcessPromise<string>;
	export function execFile(file: string, options?: ExecFileOptionsWithBufferEncoding): ChildProcessPromise<Buffer>;
	export function execFile(file: string, options?: ExecFileOptions): ChildProcessPromise<string>;
	export function execFile(file: string, args?: string[]): ChildProcessPromise<string>;
	export function execFile(file: string, args?: string[], options?: ExecFileOptionsWithStringEncoding): ChildProcessPromise<string>;
	export function execFile(file: string, args?: string[], options?: ExecFileOptionsWithBufferEncoding): ChildProcessPromise<Buffer>;
	export function execFile(file: string, args?: string[], options?: ExecFileOptions): ChildProcessPromise<string>;
	
	export function fork(modulePath: string, args?: string[],
		options?: ForkOptions&ExtendOption): ChildProcessPromise<string>;
}
