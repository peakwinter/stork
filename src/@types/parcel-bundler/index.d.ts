// Augmented type definitions for parcel-bundler 1.12
// to support plugin extensions like Asset

declare module 'parcel-bundler/lib/Asset' {
    /**
     * An Asset represents a file in the dependency tree. Assets can have multiple
     * parents that depend on it, and can be added to multiple output bundles.
     * The base Asset class doesn't do much by itself, but sets up an interface
     * for subclasses to implement.
     */
    class Asset {
        name: string;
        basename: string;
        contents: string;
        type: string;
        hmrPageReload: boolean;

        constructor(name: string, options: object);

        generate(): Promise<string>;
        addDependency(name: string, options: object): void;
    }

    export = Asset;
}

declare module 'parcel-bundler/lib/utils/localRequire' {
    function localRequire(name: string, path: string, triedInstall?: boolean): any;
    export default localRequire;
}
