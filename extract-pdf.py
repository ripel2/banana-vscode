import pdfminer.high_level
import pdfminer.layout
import re
import json

TITLE_REGEX = r"C-([a-zA-Z]) - (.*)"
SUBTITLE_REGEX = r"C-([a-zA-Z]\d) - (.*)"

def cleanup_text(text) -> list:
    """
    Cleanup the text extracted from the pdf and returns it as lines
    """
    lines = text.split("\n")
    lines = [line.strip() for line in lines]
    lines = [line for line in lines if line != ""]
    return lines


def overlaps_rects(content, rects) -> bool:
    """
    Check if the content overlaps with any of the rects
    """
    for rect_obj in rects:
        if content.hoverlap(rect_obj) and content.voverlap(rect_obj):
            return True
    return False


def extract_elements(pages) -> list:
    """
    Extract the data from the pdf pages and returns it as a list of elements
    """
    textboxes = {}
    rects = {}
    for page_index, page in enumerate(pages): 
        textboxes[page_index] = []
        rects[page_index] = []
        for content in page:
            if isinstance(content, pdfminer.layout.LTTextBoxHorizontal):
                textboxes[page_index].append(content)

            elif (isinstance(content, pdfminer.layout.LTCurve) 
            and not isinstance(content, pdfminer.layout.LTFigure)
            and not isinstance(content, pdfminer.layout.LTLine)):
                rects[page_index].append(content)
    
    return textboxes, rects


def extract_data(textboxes, rects) -> dict:
    """
    Extract the data from the pdf elements and returns it as a dict
    """
    current_title = None
    current_subtitle = None
    extract = []
    for page_index, textboxes in textboxes.items():
        for textbox in textboxes:
            text = textbox.get_text()
            title = re.match(TITLE_REGEX, text)
            subtitle = re.match(SUBTITLE_REGEX, text)

            if title:
                current_title = title

            elif subtitle:
                current_subtitle = subtitle.group(0)
                extract.append({
                    "title": current_title.group(0),
                    "subtitle": current_subtitle,
                    "language": "C",
                    "subgroup": subtitle.group(1),
                    "description": subtitle.group(2),
                    "content": []
                })

            elif current_subtitle:
                if (not overlaps_rects(textbox, rects[page_index])):
                    lines = cleanup_text(textbox.get_text())
                    extract[-1]["content"].extend(lines)

    return extract


def cleanup_extract(extract: list) -> list:
    """
    Cleanup the extract last errors like page numbers etc
    """
    for item in extract:
        if len(item["content"]) > 0 and item["content"][-1].isdigit():
            item["content"].pop()
        
        for i in range(len(item["content"])):
            item["content"][i].replace("\u2022", "-")
            item["content"][i].replace("\u2019", "'")

    return extract


def export_rules_as_json(extract: list, filename: str):
    """
    Export the rules as json
    """
    with open(filename, "w") as f:
        json.dump(extract, f, indent=4)


if __name__ == "__main__":
    pages = pdfminer.high_level.extract_pages("epitech_c_coding_style.pdf")
    textboxes, rects = extract_elements(pages)
    extract = extract_data(textboxes, rects)
    extract = cleanup_extract(extract)
    export_rules_as_json(extract, "epitech_c_coding_style.json")
