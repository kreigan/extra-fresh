const jsdom = require("jsdom"),
    { JSDOM } = jsdom,
    expect = require('chai').expect,
    lib = require('../src/fresh-lib');

var baseUrl = "http://localhost.com";
const tagsForTest = [
    "TST-1",
    "1234",
    "TST-TST",
    "---TST///",
    "tag",
    "&nbsp;",
    "---",
    "{{123}}",
    "TST-1",
    "TST-2"
];

let document, screen, tags;

describe('Tags', () => {
    describe('in ticket', () => {
        let options = { contentType: "text/html" };
        beforeEach(() => JSDOM.fromFile("test/assets/ticket-structure-tags.html", options)
            .then(dom => {
                document = dom.window.document;
                const tagTemplate = document.querySelector("li > span.tag-options");
                if (!tagTemplate) {
                    throw new Error("Invalid template structure: <span> tag was not found")
                }

                const list = tagTemplate.parentElement.parentElement;
                tagsForTest.slice(1).forEach(() => {
                    list.appendChild(list.firstElementChild.cloneNode(true));
                });

                for (let index = 0; index < list.childElementCount; index++) {
                    const tag = list.children[index].firstElementChild;
                    tag.innerHTML = tagsForTest[index];
                }
                screen = new lib.TicketView(document.getElementById('ticket-details'));
                tags = screen.getTags();
            }));
        it('should be converted', () => {
            expect(tags).to.have.lengthOf(3);
            tags.forEach(tag => lib.convertTagToUrl(tag, baseUrl));
            expect(document.querySelectorAll("li a")).to.have.lengthOf(3);
        });
    })
});