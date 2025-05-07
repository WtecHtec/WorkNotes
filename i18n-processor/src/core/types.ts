export interface ProcessOptions {
  mode: 'ast' | 'regex';
  output?: string;
  verbose?: boolean;
}

export interface ProcessResult {
  code: string;
  hasModification: boolean;
}

export interface FileConfig {
  input: string;
  output?: string;
}