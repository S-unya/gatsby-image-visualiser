import React from "react";
import cx from "classnames";
import {
    SourceImageProps,
    PictureFieldType,
    QueryFieldType,
    FormFieldType,
    DisplayImageProps
} from "../../types/types";

import styles from "./ImageForm.module.css";

interface Props extends React.FormHTMLAttributes<HTMLFormElement> {
    incomingFocus:
        | PictureFieldType
        | QueryFieldType
        | FormFieldType
        | undefined;
    setCurrentFocus: (
        f: PictureFieldType | QueryFieldType | FormFieldType | undefined
    ) => void;
    sourceImageProps: SourceImageProps;
    displayImageProps: DisplayImageProps;
    updateSourceImageProps: (
        f: (draft: SourceImageProps) => void | SourceImageProps
    ) => void;
    updateDisplayImageProps: (draft: DisplayImageProps) => void;
}

// @TODO: add fragments support
export const ImageForm: React.FC<Props> = ({
    sourceImageProps,
    updateSourceImageProps,
    displayImageProps,
    updateDisplayImageProps
}) => {
    const displayType = displayImageProps.displayType
        ? displayImageProps.displayType
        : "fixed";
    const [expanded, setExpanded] = React.useState<boolean>(false);
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const setDisplayImageWidth = React.useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const targetValue = event.target.value;

            const copy = { ...displayImageProps };
            copy.maxWidth = targetValue ? parseInt(targetValue, 10) : undefined;

            updateDisplayImageProps(copy);
        },
        [displayImageProps, updateDisplayImageProps]
    );
    const setDisplayImageHeight = React.useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const targetValue = event.target.value;

            const copy = { ...displayImageProps };
            copy.maxHeight = targetValue
                ? parseInt(targetValue, 10)
                : undefined;

            updateDisplayImageProps(copy);
        },
        [displayImageProps, updateDisplayImageProps]
    );
    const setDisplayImageQuality = React.useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const targetValue = event.target.value;

            const copy = { ...displayImageProps };
            copy.quality = targetValue ? parseInt(targetValue, 10) : undefined;

            updateDisplayImageProps(copy);
        },
        [displayImageProps, updateDisplayImageProps]
    );
    const setDisplayImageBreakpoints = React.useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const targetValue = event.target.value;

            const copy = { ...displayImageProps };
            copy.displayBreakpoints = targetValue;

            updateDisplayImageProps(copy);
        },
        [displayImageProps, updateDisplayImageProps]
    );
    const setImageDisplayType = React.useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const targetValue = event.target.value;

            if (
                targetValue === "fixed" ||
                targetValue === "fluid" ||
                !targetValue
            ) {
                const copy = { ...displayImageProps };
                copy.displayType =
                    (targetValue as "fixed" | "fluid") || undefined;

                updateDisplayImageProps(copy);
            }
        },
        [displayImageProps, updateDisplayImageProps]
    );

    const setImage = React.useCallback(
        async (event: React.ChangeEvent<HTMLInputElement>) => {
            const target: HTMLInputElement = event.nativeEvent
                .target as HTMLInputElement;

            const files: FileList | null = target?.files;
            const getInfoFromUpload = (
                file: File
            ): Promise<SourceImageProps> => {
                return new Promise((resolve, reject) => {
                    try {
                        const imageProps: SourceImageProps = {
                            name: file.name,
                            fileType: file.type.replace("image/", ""),
                            width: undefined,
                            height: undefined
                        };
                        const fileReader = new FileReader();

                        fileReader.readAsDataURL(file);
                        fileReader.onload = () => {
                            const img = new Image();

                            // @todo: may wish to use this for making a live image example
                            img.src = fileReader.result as string;
                            imageProps.width = img.width;
                            imageProps.height = img.height;

                            resolve(imageProps);
                        };
                    } catch (err) {
                        reject(err);
                    }
                });
            };

            if (files?.length) {
                const imageInfo = await getInfoFromUpload(files[0]);

                updateSourceImageProps((draft: SourceImageProps) => {
                    draft.width = imageInfo.width;
                    draft.height = imageInfo.height;
                    draft.fileType = imageInfo.fileType;
                    draft.name = imageInfo.name;
                });
            }
        },
        [updateSourceImageProps]
    );

    const outPutImageTypeFields = () => {
        const baseProperties = (
            <>
                <div className="input-wrap">
                    <label htmlFor="image-width">Display width</label>{" "}
                    <input
                        type="number"
                        value={displayImageProps.maxWidth}
                        onChange={setDisplayImageWidth}
                        placeholder="800"
                    />
                </div>
                <div className="input-wrap">
                    <label htmlFor="image-height">Display height</label>{" "}
                    <input
                        type="number"
                        value={displayImageProps.maxHeight}
                        onChange={setDisplayImageHeight}
                    />
                </div>
                <div className="input-wrap">
                    <label htmlFor="image-quality">
                        Image compression quality
                    </label>{" "}
                    <input
                        type="number"
                        value={displayImageProps.quality}
                        onChange={setDisplayImageQuality}
                        max="100"
                        min="0"
                        placeholder="50"
                    />
                </div>
            </>
        );

        const fluidProperties = (
            <>
                <div className="input-wrap">
                    <label htmlFor="image-breakpoints">
                        Display image sizes (comma separated)
                    </label>{" "}
                    <input
                        type="text"
                        value={displayImageProps.displayBreakpoints || ""}
                        onChange={setDisplayImageBreakpoints}
                        placeholder="800"
                    />
                </div>
            </>
        );

        return (
            <>
                {displayType === "fixed"
                    ? baseProperties
                    : [baseProperties, fluidProperties]}
            </>
        );
    };

    const toggleExpanded = React.useCallback(
        (event: React.MouseEvent) => {
            event.preventDefault();
            setExpanded(!expanded);
        },
        [setExpanded, expanded]
    );

    return (
        <form className={cx("section", styles.component)}>
            <fieldset className={styles.fieldSet}>
                <legend className={styles.legend}>The original image</legend>
                <p>
                    This is necessary to calculate the sizes of the source
                    image. This is done entirely on your computer.
                </p>
                <div className="input-wrap">
                    <label htmlFor="source-image">Hi-res source image:</label>{" "}
                    <input
                        type="file"
                        id="source-image"
                        onChange={setImage}
                        accept="image/png, image/jpg, image/webp"
                    />
                </div>
                <h3>Image information</h3>
                <dl>
                    <dt>Name:</dt>
                    <dd>{sourceImageProps.name}</dd>
                    <dt>Width:</dt>
                    <dd>{sourceImageProps.width}</dd>
                    <dt>Height:</dt>
                    <dd>{sourceImageProps.height}</dd>
                    <dt>File type:</dt>
                    <dd>{sourceImageProps.fileType}</dd>
                </dl>
            </fieldset>
            <div>
                <button
                    aria-haspopup={true}
                    aria-controls="displayImageFields"
                    onClick={toggleExpanded}
                    className={styles.displayButton}
                >
                    Automatically create GraphQl?
                </button>
                <fieldset
                    id="displayImageFields"
                    aria-expanded={expanded}
                    aria-hidden={!expanded}
                    className={styles.fieldSet}
                >
                    {expanded ? (
                        <>
                            <legend className={styles.legend}>
                                How the image will display
                            </legend>
                            <p>
                                These options are about how you want your image
                                to display, there is more help available for
                                each field.
                            </p>
                            <div className="input-wrap">
                                <label htmlFor="image-type-fixed">
                                    Fixed size (with appropriate images for
                                    hi-res screens):
                                </label>{" "}
                                <input
                                    type="radio"
                                    id="image-type-fixed"
                                    name="image-type"
                                    value="fixed"
                                    checked={displayType === "fixed"}
                                    onChange={setImageDisplayType}
                                />
                                <label htmlFor="image-type-fluid">
                                    Fluid size (adapts to the width of the
                                    screen):
                                </label>{" "}
                                <input
                                    type="radio"
                                    id="image-type-fluid"
                                    name="image-type"
                                    value="fluid"
                                    checked={displayType === "fluid"}
                                    onChange={setImageDisplayType}
                                />
                                <div className="help">Some help here</div>
                            </div>
                            {outPutImageTypeFields()}
                        </>
                    ) : null}
                </fieldset>
            </div>
            <canvas ref={canvasRef} className={styles.canvas} />
        </form>
    );
};
export default ImageForm;
