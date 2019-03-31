// Augmented type definitions for parcel-bundler 1.12
// to support plugin extensions like Asset
declare module 'parcel-bundler/lib/Asset' {
    import { ParcelOptions } from "parcel-bundler";

    /**
     * An Asset represents a file in the dependency tree. Assets can have multiple
     * parents that depend on it, and can be added to multiple output bundles.
     * The base Asset class doesn't do much by itself, but sets up an interface
     * for subclasses to implement.
     */
    class Asset {
        id: string;
        name: string;
        relativeName: string;
        basename: string;
        contents: string;
        type: string;
        hmrPageReload: boolean;
        generated: GeneratedAsset;
        options: object;

        constructor(name: string, options: object);

        addDependency(name: string, options: object): void;
        loadIfNeeded(): Promise<void>;
        pretransform(): Promise<void>;
        getDependencies(): Promise<void>;
        transform(): Promise<void>;
        generate(): Promise<GeneratedAsset>;
        getConfig(filenames: string[], opts: GetConfigOpts): Promise<any>;
    }

    interface GetConfigOpts {
        packageKey?: string;
        path?: string;
        load?: boolean;
    }

    interface GeneratedAsset {
        [assetType: string]: string;
    }

    export = Asset;
}

declare module 'parcel-bundler/lib/utils/localRequire' {
    function localRequire(name: string, path: string, triedInstall?: boolean): any;
    export default localRequire;
}

declare module 'parcel-bundler/lib/utils/md5' {
    function md5(string: string, encoding: string): string;
    export = md5;
}
