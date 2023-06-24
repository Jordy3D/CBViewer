import os
import re
import shutil
import sys
from tkinter import *
from PIL import Image, ImageTk
import zipfile

current_page = 0
current_chapter = 0
pages = None
chapters = None

window = None
canvas = None

filename = None

debug = False


def open_cbz(file):
    # a CBZ file is just a zip file with a different extension
    # it contains images, which are the pages of the volume

    global filename
    # set the filename to the name of the file
    filename = os.path.basename(file)

    print(f"Opening {filename}...")

    # unzip the CBZ file
    if not os.path.exists("read_temp"):
        os.makedirs("read_temp")

    with zipfile.ZipFile(file, "r") as zip_ref:
        zip_ref.extractall("read_temp")

    # get the name of the volume
    volume_name = os.path.basename(file)[:-4]

    # create a folder for the volume
    if not os.path.exists("read_temp/" + volume_name):
        os.makedirs("read_temp/" + volume_name)

    # move the images into the volume folder
    for image in os.listdir("read_temp"):
        if image.endswith(".jpg") or image.endswith(".png"):
            shutil.move("read_temp/" + image, "read_temp/" + volume_name + "/" + image)

    print(f"Opened {volume_name}")


def open_cbv(file):
    # a CBV file is just a zip file with a different extension
    # it contains CBZ files, which are also zip files with a different extension
    # each CBZ file is a chapter of the volume

    global filename
    # set the filename to the name of the file
    filename = os.path.basename(file)

    print(f"Opening {filename}...")

    # unzip the CBV file
    if not os.path.exists("read_temp"):
        os.makedirs("read_temp")

    with zipfile.ZipFile(file, "r") as zip_ref:
        zip_ref.extractall("read_temp")

    # get the name of the volume
    volume_name = os.path.basename(file)[:-4]

    # create a folder for the volume
    if not os.path.exists("read_temp/" + volume_name):
        os.makedirs("read_temp/" + volume_name)

    # move the chapters into the volume folder
    for chapter in os.listdir("read_temp"):
        if chapter.endswith(".cbz"):
            # unzip the chapter
            with zipfile.ZipFile("read_temp/" + chapter, "r") as zip_ref:
                zip_ref.extractall("read_temp/" + volume_name + "/" + chapter[:-4])

            # delete the cbz file
            os.remove("read_temp/" + chapter)

    print(f"Opened {volume_name}")


def generate_pagelist(path, cbz_mode=False):
    if cbz_mode:
        # set chapters to an array with 1 element, the path
        chapters = [path]
        
        pages = {}
        for chapter in chapters:
            pages[chapter] = []
            for page in os.listdir(f"{path}"):
                pages[chapter].append(f"{path}/{page}")

        return pages

    # collect all of the chapters into a list
    chapters = []
    for chapter in os.listdir(path):
        # if chapre is a folder, add it to the list
        if os.path.isdir(path + "/" + chapter):
            chapters.append(chapter)

    # create a list for each chapter containing the pages of the chapter
    pages = {}
    for chapter in chapters:
        pages[chapter] = []
        for page in os.listdir(f"{path}/{chapter}"):
            pages[chapter].append(f"{path}/{chapter}/{page}")

    return pages


def load_image(path, canvas=None):
    print(f"  Loading page...")
    im = Image.open(path)

    # resize the image to fit the canvas
    if canvas:
        width, height = im.size
        canvas_width, canvas_height = canvas.winfo_reqwidth(), canvas.winfo_reqheight()

        if debug:
            print(f"Raw Image size: {width}x{height}")
            print(f"Canvas size: {canvas_width}x{canvas_height}")

        # reize the image to fit the canvas
        if width > canvas_width or height > canvas_height:
            # resize the image to fit the canvas
            ratio = min(canvas_width / width, canvas_height / height)
            im = im.resize((int(width * ratio), int(height * ratio)), Image.ANTIALIAS)
            
            if debug:
                print(f"Resized Image size: {im.size}")

    # convert the image to a PhotoImage
    ph = ImageTk.PhotoImage(im)

    print(f"  Page loaded")

    return ph


def display_page(page, canvas):
    print(f"Displaying Chapter {current_chapter + 1} Page {current_page + 1}...")

    cv_img = load_image(page, canvas)

    # clear the canvas
    canvas.delete("all")

    canvas.create_image(0, 0, anchor="nw", image=cv_img)
    canvas.image = cv_img
    canvas.pack()


def create_ribbon(window, controls):
    # create buttons for going to the next and previous pages and chapters in a ribbon at the top of the window
    ribbon = Frame(window)
    ribbon.pack(side=TOP)

    # create buttons for going to the next and previous pages
    next_page_button = Button(ribbon, text="Next Page", command=controls.next_page)
    next_page_button.pack(side=RIGHT)

    previous_page_button = Button(
        ribbon, text="Previous Page", command=controls.previous_page
    )
    previous_page_button.pack(side=RIGHT)

    # # create buttons for going to the next and previous chapters
    next_chapter_button = Button(
        ribbon, text="Next Chapter", command=controls.next_chapter
    )
    next_chapter_button.pack(side=RIGHT)

    previous_chapter_button = Button(
        ribbon, text="Previous Chapter", command=controls.previous_chapter
    )
    previous_chapter_button.pack(side=RIGHT)

    return ribbon


class Controls:
    # create buttons for going to the next and previous pages
    def next_page():
        global current_page
        global current_chapter
        global canvas
        # if the current page is not the last page, go to the next page
        if current_page < len(pages) - 1:
            current_page += 1
            display_page(pages[current_page], canvas)
        elif current_page == len(pages) - 1:
            # if the current page is the last page, go to the next chapter
            Controls.next_chapter()

        Controls.update_window_title()

    def previous_page():
        global current_page
        global current_chapter
        global canvas
        # if the current page is not the first page, go to the previous page
        if current_page > 0:
            current_page -= 1
            display_page(pages[current_page], canvas)
        elif current_page == 0:
            # if the current page is the first page, go to the previous chapter
            Controls.previous_chapter(True)

        Controls.update_window_title()

    # create buttons for going to the next and previous chapters
    def next_chapter():
        global current_page
        global current_chapter
        global canvas
        # if the current chapter is not the last chapter, go to the next chapter
        if current_chapter < len(chapters) - 1:
            current_chapter += 1
            current_page = 0
            load_chapter()
            display_page(pages[current_page], canvas)

        Controls.update_window_title()

    def previous_chapter(from_page=False):
        global current_page
        global current_chapter
        global canvas
        # if the current chapter is not the first chapter, go to the previous chapter
        if current_chapter > 0:
            current_chapter -= 1
            current_page = 0

            load_chapter()
            if from_page:
                # if the previous chapter was called from the previous page button, set the current page to the last page of the chapter
                current_page = len(pages) - 1
            display_page(pages[current_page], canvas)

        Controls.update_window_title()

    def update_window_title():
        global window
        window.title(
            f"CBViewer - {filename} - Page {current_page + 1}/{len(pages)} - Chapter {current_chapter + 1}/{len(chapters)}"
        )


def load_chapter():
    global pages
    pages = []
    for page in pagelist[chapters[current_chapter]]:
        pages.append(page)


def view_pages(pagelist):
    global current_page
    global current_chapter

    global window
    global canvas
    global filename
    # create a UI for reading the volume
    # just need to display the current page, and have buttons for next and previous page
    # also need a button for going to the next chapter
    # and a button for going to the previous chapter

    # create a window
    window = Tk()
    window.title(f"CBViewer - {filename}")
    
    # create a ribbon for the buttons, passing this function as the parent
    ribbon = create_ribbon(window, Controls)

    # create a canvas for displaying the pages
    canvas = Canvas(window)

    # use the pagelist to display the pages
    # create a list of the chapters
    global chapters
    chapters = []
    for chapter in pagelist:
        chapters.append(chapter)

    print(f"Chapters found: {len(chapters)}")

    # create a list of the pages
    load_chapter()

    # create a list of the pages in the current chapter
    current_chapter = 0
    current_page = 0

    display_page(pages[current_page], canvas)

    # resize image and canvas when window is resized
    def resize_image(event=None):
        global current_page
        global current_chapter
        global canvas

        # resize the canvas to fit the window, subtracting the height of the ribbon
        target_width = window.winfo_width() - 4
        target_height = window.winfo_height() - ribbon.winfo_height() - 4

        if debug:
            print(f"Window size: {target_width}x{target_height}")

        if target_width > 0 and target_height > 0:
            if debug:
                print(f"Resizing canvas to {target_width}x{target_height}")
            canvas.config(width=target_width, height=target_height)

        if current_page:
            display_page(pages[current_page], canvas)

    window.bind("<Configure>", resize_image)
    resize_image()

    # bind the arrow keys to the next and previous page buttons
    window.bind("<Left>", lambda event: Controls.previous_page())
    window.bind("<Right>", lambda event: Controls.next_page())

    canvas.pack()

    Controls.update_window_title()    

    # run the window
    window.mainloop()


if __name__ == "__main__":
    # get a file passed as an argument, and if there isn't a file ask for one
    if len(sys.argv) > 1:
        file = sys.argv[1]
    else:
        file = input("Enter path to CBV file: ")

    # if the file is a CBZ file
    if file.endswith(".cbz"):
        open_cbz(file)
        pagelist = generate_pagelist(f"read_temp/{filename[:-4]}", cbz_mode=True)
    elif file.endswith(".cbv"):
        open_cbv(file)
        pagelist = generate_pagelist(f"read_temp/{filename[:-4]}")
    else:
        print("File type not supported")
        exit()

    view_pages(pagelist)

    # delete the temporary directory when the volume is closed
    shutil.rmtree("read_temp")