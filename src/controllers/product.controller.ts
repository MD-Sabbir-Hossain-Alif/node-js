import type { IncomingMessage, ServerResponse } from "http";
import { createProduct, productService } from "../service/product.service";
import type { Iproduct } from "../types/product";
import { bodyParser } from "../utils/parseBody";
import { sendResponse } from "../utils/sendResponse";

const productController = async (req: IncomingMessage, res: ServerResponse) => {
    const url = req.url;
    const method = req.method;

    const urlParams = url?.split("/");
    // console.log(urlParams)

    const id =
        urlParams && urlParams[1] === "products" ? Number(urlParams[2]) : null;

    //  console.log(id)

    //* GET All Products
    if (url === "/products" && method === "GET") {
        const products = productService();

        try {
                    sendResponse(
                        res,
                        true,
                        200,
                        "Products retrived successfully",
                        products,
                    );

        } catch (error) {
                    sendResponse(
                        res,
                        false,
                        500,
                        "Internal server error",
                    );

        }



    } else if (id !== null && method === "GET") {
        const products = productService();
        const product = products.find((p: Iproduct) => p.id === id);

        if (!product) {
            sendResponse(res, true, 404, "Product not found")
            return;
        }

        res.writeHead(200, {
            "Content-Type": "application/json",
        });

        res.end(
            JSON.stringify({
                data: product,
                message: "Product retrived successfully",
            }),
        );
    } else if (url === "/products" && method === "POST") {
        const body = await bodyParser(req);
        // console.log(body)

        const products = productService(); // [{}, {}, {}]

        const newProduct = {
            id: Date.now(),
            ...body,
        };

        // console.log(newProduct);

        products.push(newProduct); // [{}, {}, {}, {new}]

        createProduct(products);

        res.writeHead(201, {
            "Content-Type": "application/json",
        });

        res.end(
            JSON.stringify({
                data: newProduct,
                message: "Products created successfully",
            }),
        );
    } else if (id !== null && method === "PUT") {
        const body = await bodyParser(req);
        const products = productService(); // [{}, {}, {}]

        //* Find searched product id
        const index = products.findIndex((p: Iproduct) => p.id === id);
        // console.log(index);

        //* handel invalid product
        if (index < 0) {
            res.writeHead(404, {
                "Content-Type": "application/json",
            });

            res.end(
                JSON.stringify({
                    message: "Product not found",
                }),
            );

            return;
        }

        // console.log(products[index])

        //* Set the product
        products[index] = { id: products[index].id, ...body };
        // console.log(products[index])

        //* Create the product
        createProduct(products);

        res.writeHead(200, {
            "Content-Type": "application/json",
        });

        res.end(
            JSON.stringify({
                data: products[index],
                message: "Products updated successfully",
            }),
        );
    } else if (id !== null && method === "DELETE") {
        const products = productService(); // [{}, {}, {}]
        // const body = await bodyParser(req);

        //* Find searched product id
        const index = products.findIndex((p: Iproduct) => p.id === id);
        // console.log(index);

        //* handel invalid product
        if (index < 0) {
            res.writeHead(404, {
                "Content-Type": "application/json",
            });
            res.end(
                JSON.stringify({
                    message: "Product not found",
                }),
            );
            return;
        }

        // const arr = ["a", "b", "c"];
        // console.log(arr.splice(2.1));

        //* remove item form array
        const deletedProduct = products.splice(index, 1);
        // console.log(deletedProduct);

        //* update product array
        createProduct(products);

        res.writeHead(200, {
            "Content-Type": "application/json",
        });

        res.end(
            JSON.stringify({
                data: deletedProduct,
                message: "Products deleted successfully",
            }),
        );
    }
};

export default productController;
