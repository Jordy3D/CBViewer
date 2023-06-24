import os
import zipfile
import re
import json
import shutil

class CBV:
    # a CBV file contains a series, author, artist, description, volume title, volume number, release date, isbn, array of genres, and array of chapter titles
    def __init__(self, series="", author="", artist="", description="", volume_title="", volume="", release_date="", isbn="", genres=[], chapters=[]):
        self.series = series
        self.author = author
        self.artist = artist
        self.description = description
        self.volume_title = volume_title
        self.volume = volume
        self.release_date = release_date
        self.isbn = isbn
        self.genres = genres
        self.chapters = chapters

    def __str__(self):
        string = ""
        for attr, value in self.__dict__.items():
            string += f"{attr}\n{split_print(value, 75, 3, space_char=' ')}\n\n"

        return string

def load_cbv(file):
    # create temporary directory
    if not os.path.exists("temp"):
        os.mkdir("temp")

    # unzip the cbv file
    with zipfile.ZipFile(file, "r") as zip_ref:
        zip_ref.extractall("temp")

    # load details.json
    with open("temp/details.json", "r") as f:
        details = json.load(f)

    # parse details.json into CBV object
    cbv = CBV()
    cbv.series = details["series"]
    cbv.author = details["author"]
    cbv.artist = details["artist"]
    cbv.description = details["description"]
    cbv.volume_title = details["volume_title"]
    cbv.volume = details["volume"]
    cbv.release_date = details["release_date"]
    cbv.isbn = details["isbn"]
    cbv.genres = details["genre"]
    cbv.chapters = details["chapters"]

    # delete temporary directory
    shutil.rmtree("temp")

    return cbv  

def split_print(string, max_length, pre_space_length, space_char=" "):
    # if string is not a string
    if not isinstance(string, str):
        # if string is a list, join the list with newlines
        if isinstance(string, list):
            string = "\n".join(string)
        # otherwise, convert string to a string
        else:
            string = str(string)

    content = []
    remaining = string

    # while remaining is longer than max_length
    while len(remaining) > max_length:
        # find the last space before max_length
        space = remaining.rfind(" ", 0, max_length)
        # if there is no space, find the first space after max_length
        if space == -1:
            space = remaining.find(" ", max_length)
        # if there is no space, break
        if space == -1:
            break

        # add the substring before the space to content
        content.append(f"{remaining[:space]}")
        # remove the substring before the space from remaining
        remaining = remaining[space + 1:]

    # add the remaining string to content
    content.append(remaining)
    
    # add pre_space_length spaces to the beginning of each line
    for i in range(len(content)):
        # if the line contains any newlines, split the line and add pre_space_length spaces to the beginning of each line
        if "\n" in content[i]:
            content[i] = content[i].split("\n")
            for j in range(len(content[i])):
                content[i][j] = f"{space_char * pre_space_length}{content[i][j]}"
            content[i] = "\n".join(content[i])
        # otherwise, add pre_space_length spaces to the beginning of the line
        else:
            content[i] = f"{space_char * pre_space_length}{content[i]}"

    # print(content)

    # join content with newlines
    content = "\n".join(content)
    
    return content


if __name__ == "__main__":
    cbv = load_cbv("CBVs/test.cbv")

    print(cbv)