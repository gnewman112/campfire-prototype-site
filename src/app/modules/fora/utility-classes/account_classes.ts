interface EmberProperties {
    readonly platform: string;
    readonly subPlatform: string;
}

export class Stream extends Object implements EmberProperties {
    constructor(readonly platform: string, readonly subPlatform: string) {
        super();
        this.platform = platform;
        this.subPlatform = subPlatform;
    }
}

/**
 * Options needed for reddit get requests and other operations.
 * 
 * @param subreddit Prefixed Subreddit
 * @param count Number of new items to get. Starts at 10.
 * @param sort The sort method being used. Matches reddit's sort options
 * @param time Only relevant for 'sort: top'. Matches reddit's time options
 */
export class RedditStream extends Stream {
    private _count: number;
    constructor(
        readonly subreddit: string,
        private _sort: string, //'top' | 'new'| 'hot'| 'rising'| 'best',
        private _time: string | undefined, //'hour' | 'day' | 'week' | 'month' | 'year' | 'all' | undefined,
        public after: string | undefined
        ) {
        super('reddit', subreddit);
        this.sort = _sort;
        this.time = _time;
        this._count = 10;
    }

    set sort(newSortMethod: string) {
        if ( newSortMethod == undefined || RedditStream.possibleSorts.includes( newSortMethod.toLowerCase() ) ) {
            this._sort = newSortMethod;
        } else { throw new Error('RedditStream "sortMethod" must be one of: "top", "new", "hot", "rising", "best"') }
    }
    get sort(): string {
        return this._sort;
    }

    set time(newTime: string) {
        if (newTime == undefined || RedditStream.possibleTimes.includes( newTime.toLowerCase() ) ) {
            this._time = newTime
        }
    }
    get time(): string | undefined {
        return this._time;
    }

    set count(newCount: number) {
        if (newCount > 0 && newCount <= 10 ) {
            this._count = newCount;
        }
    }
    get count(): number {
        return this._count;
    }

    static get possibleSorts(): string[] {
        return new Array('top', 'new', 'hot', 'rising', 'best');
    }
    static get possibleTimes(): string[] {
        return new Array('hour', 'day', 'week', 'month', 'year', 'all');
    }
}