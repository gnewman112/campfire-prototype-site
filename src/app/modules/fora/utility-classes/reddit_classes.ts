import { ContentHelper } from './content_helper';

interface ThingProperties {
    id?: string;
    name?: string;
    kind: string;
    data: Listing | Object;
}

interface ListingProperties {
    before: string | null;
    after: string | null;
    modhash: string;
    children: Thing[];
}

export class Thing extends Object implements ThingProperties {
    readonly id?: string;
    readonly name?: string;
    readonly kind: string;
    readonly data: Listing | Link | RedditComment | Object;
    
    constructor(value: Object | Thing) {
        super();
        let thing = <Thing>value;
        try {
            if (thing.id) { this.id = thing.id; }
            if (thing.name) { this.name = thing.name; }
            this.kind = thing.kind;
            switch (thing.kind) {
                case 't1':
                    this.data = new RedditComment(thing.data);
                    break;
                case 't2':
                    this.data = new Object(thing.data);
                    break;
                case 't3':
                    this.data = new Link(thing.data);
                    break;
                case 't4':
                    this.data = new Object(thing.data);
                    break;
                case 't5':
                    this.data = new Object(thing.data);
                    break;
                case 't6':
                    this.data = new Object(thing.data);
                    break;
                case 'Listing':
                    this.data = new Listing(thing.data);
                    break;
                default:
                    this.data = new Object(thing.data);
                    throw new SyntaxError(`"Thing" of kind ${thing.kind} not recognized. Default "Object" class used.`);
            }
        } catch (err) { 
            console.error(err);
            if (!(err instanceof SyntaxError) && !err.message.includes('"Thing" of kind')) {
                console.error(new Error('Value not compatible with type "Thing"'));
            }
        }
            
    }

    static typePrefix(value: string) {
        let subString = value.substr(0,2);
        switch (subString) {
            case 't1':
                return 'Comment';
            case 't2':
                return 'Account';
            case 't3':
                return 'Link';
            case 't4':
                return 'Message';
            case 't5':
                return 'Subreddit';
            case 't6':
                return 'Award';
            default:
                throw new Error(`${subString} from ${value} not recognized as a Reddit Type Prefix.`)
        }
    }
}

export class Listing extends Object implements ListingProperties {
    readonly before: string | null;
    readonly after: string | null;
    readonly modhash: string;
    readonly children: Array<Thing>;

    constructor(value: Object) {
        super();
        try {
            let listing = <Listing>value;
            this.before = listing.before;
            this.after = listing.after;
            this.modhash = listing.modhash;
            let a = new Array();
            listing.children.forEach(thing => {a.push(new Thing(thing))});
            this.children = a;
        } catch (err) { console.error(err); throw new Error('Value not compatible with type "Listing"');}
    }
}

export class Link extends Object implements votable, created {
    archived: boolean;
    author: any;
    created: Date;
    created_utc: Date;
    createdString: string;
    crosspost_parent_list: Array<Link>;
    distinguished: string;
    domain: string;
    downs: number;
    edited: Date;
    editedString: string;
    gallery_data: {
        items: Array<{media_id: string; caption: string}>;
    };
    is_original_content: boolean;
    likes: boolean | null;
    locked: boolean;
    media_metadata: Map<string, {
        s: {
            x: number;
            y: number;
            u: string;
        }
    }>;
    name: string;
    num_comments: number;
    over_18: boolean;
    permalink: string;
    pinned: boolean;
    poll_data: {
        is_prediction: boolean;
        options: Array<{id: number, text: string}>;
        resolved_option_id: any;
        total_stake_amount: any;
        total_vote_count: string;
        user_selection: any;
        user_won_amount: any;
        voting_end_timestamp: Date;
    };
    post_hint: string;
    preview: {
        enabled: boolean;
        images: Array<{ source: {height: number, width: number}}>;
        reddit_video_preview: {fallback_url: string, transcoding_status: string, height: number, width: number};
    };
    score: number;
    secure_media: { reddit_video: { 
        dash_url: string;
        hls_url: string;
        scrubber_media_url: string;
        fallback_url: string;
        height: number;
        width: number;
    }};
    secure_media_embed: {
        content: string;
        height: number;
        media_domain_url: string;
        scrolling;
        width: number; 
    }
    selftext: string;
    selftext_html: string;
    spoiler: boolean;
    stickied: boolean;
    subreddit: string;
    subreddit_name_prefixed: string;
    subredit_id: string;
    thumbnail: string
    title: string;
    url: string;
    ups: number;
    upvote_ratio: number;

    constructor(value: Object) {
        super();
        let linkValue = <Link>value;
        try {
            Object.assign(this, linkValue);

            if ( typeof this.author != 'string' && this.author.name ) {
                this.author = this.author.name;
            }

            if (this.crosspost_parent_list) {
                this.crosspost_parent_list.forEach( (value, index) => { 
                    this.crosspost_parent_list[index] = new Link(value);
                });
            }

            if (linkValue.media_metadata) {
                let metadataObject = <Object>linkValue.media_metadata;
                this.media_metadata = new Map(Object.entries(metadataObject));
            }
            
            this.title = ContentHelper.UnescapeHTMLTextContent(this.title);
            this.editedString = (typeof this.edited == 'number') ? timeSince(this.edited) : '';
            this.createdString = timeSince(this.created_utc);
        } catch (err) { console.error(err); throw new Error('Value not compatible with type "Link"');}
    }
}

export class RedditComment extends Object implements votable, created {
    author: string;
    author_cakeday: boolean;
    archived: boolean;
    body_html: string;
    can_mod_post: boolean;
    collapsed: false;
    created: Date;
    created_utc: Date;
    createdString: string;
    distinguished: string;
    downs: number;
    depth: number;
    edited: boolean | Date;
    editedString: string;
    is_submitter: boolean;
    likes: boolean;
    link_id: string;
    locked: boolean;
    name: string;
    parent_id: string;
    permalink: string;
    replies: Array<RedditComment>;
    score: number;
    send_replies: boolean;
    stickied: boolean;
    ups: number;

    constructor(value: Object) {
        super();
        let commentValue = <RedditComment> value;
        try {
            Object.assign(this, commentValue);
            this.createdString = timeSince(commentValue.created_utc);
            this.editedString = (typeof commentValue.edited == 'number') ? timeSince(commentValue.edited) : '';
            commentValue.replies.forEach( (reply, index) => {
                this.replies[index] = new RedditComment(reply) 
            });
        } catch (err) {
            console.error(err);
            throw new Error ('Value not compatible with type "Comment"');
        }
        
    }
}

interface votable {
    ups: number;
    downs: number;
    likes: boolean | null;
}

interface created {
    created: Date;
    created_utc: Date;
}

/**
 * Returns a the time since creation (eg. '2 months ago')
 * @param createdTimeUTC The time when the spark was created (currently this is created_utc)
 */
function timeSince(createdTimeUTC: Date): string {
    let now = Date.now() / 1000;

    let returnString: string, time: number;
    let interval = (now - Number(createdTimeUTC));
    if (interval < 60) {
        returnString = 'moments ago';

    } else if (interval < 3600) {
        time = Math.floor(interval / 60);
        returnString = `${time} minute`;

    } else if (interval < 86400) {
        time = Math.floor(interval / 3600);
        returnString = `${time} hour`;

    } else if (interval < 2629746) { // based on an average Gregorian calendar month of 30.436875 days
        time = Math.floor(interval / 86400);
        returnString = `${time} day`;

    } else if (interval < 31556952) {
        time = Math.floor(interval / 2629746);
        returnString = `${time} month`;

    } else {
        time = Math.floor(interval / 31556952);
        returnString = `${time} year`;
    }

    if (time > 1) {
        return `${returnString}s ago`
    } else {
        return `${returnString} ago`;
    }
}