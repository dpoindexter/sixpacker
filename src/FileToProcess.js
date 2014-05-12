class FileToProcess {

    constructor (reference) {
        this.reference = reference;
        this.resolver = new PromiseResolver();
    }

    create (err, contents) {
        if (err) {
            this.resolver.reject(err);
        }

        this.fileContents = contents;
    }

    process () {

    }

}