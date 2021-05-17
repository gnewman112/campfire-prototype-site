export class ContentHelper {
    private constructor () {
        throw new SyntaxError('Instances of ContentHelper or derived classes are not allowed.')
    }

    /**
    * Converts number into psuedo scientific notation
    * @param number The number to be converted
    */
    static CreatePseudoNumber(number: number): string {
        if (number < 1000) {
        return `${number}`;
        } else if (number < 1000000) {
        let score = Math.floor(number/100)/10;
        return `${score}k`;
        } else {
        let score = Math.floor(number/100000)/10;
        return `${score}M`;
        }
    }

    /**
     * This returns just the text content of the sourceHTML. If the HTML tags are needed use UnescapeHTML()
     * @param sourceHTML A string such as spark.title to unescape and remove HTML tags.
     */
    static UnescapeHTMLTextContent(sourceHTML: string): string {
        let parser = new DOMParser();
        let text1 = parser.parseFromString(sourceHTML, 'text/html')
        let temp = text1.documentElement
        let text = temp.textContent;
        return text;
    }

        /**
     * Warning: use UnescapeHTMLTextContent if you do not want any HTML tags including scripts to remain.
     * 
     * This will return a string containing all html content
     * @param sourceHTML A string such as spark.title or spark.selftext_html to unescape
     */
    static UnescapeHTML(sourceHTML: string): string {
        let parser = new DOMParser();
        let element = parser.parseFromString(sourceHTML, 'text/html');
        let a = element.body.children[0].innerHTML;
        let b = element.body.firstElementChild.innerHTML;
        return b;
    }

    /**
     * This will find all anchor tags within the element and add target='_blank' and rel='noopener'.
     * Also if any reddit links begin '/r/' the link will be completed.
     * @param element An element which may or may not have anchor tags.
     */
    static SafeAllATags(element: HTMLElement) {
        if (element instanceof HTMLElement) {
            let links = element.getElementsByTagName('a');
            for (let i = 0; i < links.length; i++) {
              links[i].target = '_blank';
              links[i].rel = 'noopener';

              if (links[i].href.includes('/r/') || links[i].href.includes('/u/') ) {
                links[i].href = completeRedditLinks(links[i].pathname);
              }
            }
        } else { throw new Error('The "element" passed must be an instance of HTMLElement') }
    }

    /**
    * Returns a mixed case string matching reddit's Time names
    * @param time Must be one of RedditService.possibleTimes()
    */
    static redditTimeConversion(time: string): string {
        switch (time) {
            case 'hour': return 'This Hour';
            case 'day': return 'Today';
            case 'week': return 'This Week';
            case 'month': return 'This Month';
            case 'year': return 'This Year';
            case 'all': return 'All Time';
            case undefined: return undefined;
            default: return time;
        }
    }
}

function completeRedditLinks(linkHref: string): string {
    if (!linkHref.includes('reddit')) {
        return 'https://reddit.com' + linkHref;
    }
}