import { ShopProductCard, type ShopProduct } from "@/components/dashboard/shop/shop-product-card.tsx";
import styles from "./DashboardShop.module.css";

const SHOP_PRODUCTS: ShopProduct[] = [
    {
        id: "brand-cap",
        title: "Кепка брендированная",
        description: "Описание товара на два-три слова, очень много буквок.",
        price: 245,
        stock: 3,
    },
    {
        id: "brand-cap-blue",
        title: "Кепка брендированная",
        description: "Описание на два или три слова, очень много буквок.",
        price: 245,
        stock: 5,
    },
    {
        id: "brand-cap-nodiscount",
        title: "Кепка брендированная",
        description: "Описание на два или три слова, очень много буквок.",
        price: 245,
        stock: 6,
    },
    {
        id: "brand-cap-sale",
        title: "Кепка брендированная",
        description: "Описание на два или три слова, очень много буквок.",
        price: 245,
        stock: 20,
    },
];

const DashboardShopPage = () => {
    return (
        <section className={styles.root}>
            <div className={styles.productsGrid}>
                {SHOP_PRODUCTS.map((product) => (
                    <ShopProductCard key={product.id} product={product} />
                ))}
            </div>
        </section>
    );
};

export default DashboardShopPage;
