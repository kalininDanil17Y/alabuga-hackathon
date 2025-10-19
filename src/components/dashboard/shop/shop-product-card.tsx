import { useMemo, useState } from "react";
import clsx from "clsx";
import { number_format } from "@/lib/utils.ts";
import styles from "./shop-product-card.module.css";
import ManaIcon from "@/images/ui/mana.svg?react";

export interface ShopProduct {
    id: string;
    title: string;
    description: string;
    price: number;
    oldPrice?: number;
    stock: number;
    image?: string;
    discountLabel?: string;
}

interface ShopProductCardProps {
    product: ShopProduct;
}

export function ShopProductCard({ product }: ShopProductCardProps) {
    const { price, oldPrice, stock } = product;
    const [quantity, setQuantity] = useState(() => (stock > 0 ? 1 : 0));

    const isDiscounted = useMemo(() => oldPrice !== undefined && oldPrice > price, [oldPrice, price]);
    const discountLabel = product.discountLabel ?? (isDiscounted ? "скидка" : undefined);
    const isOutOfStock = stock === 0;

    const totalPrice = useMemo(() => quantity * price, [quantity, price]);
    const buttonLabel = isOutOfStock ? "нет в наличии" : `купить ${number_format(totalPrice)}`;

    const canDecrease = !isOutOfStock && quantity > 1;
    const canIncrease = !isOutOfStock && quantity < stock;

    const handleDecrease = () => {
        if (canDecrease) {
            setQuantity((prev) => Math.max(1, prev - 1));
        }
    };

    const handleIncrease = () => {
        if (canIncrease) {
            setQuantity((prev) => Math.min(stock, prev + 1));
        }
    };

    return (
        <article className={styles.card}>
            <div className={styles.imageWrapper}>
                {discountLabel ? <span className={styles.discountBadge}>{discountLabel}</span> : null}
                {product.image ? (
                    <img src={product.image} alt={product.title} className={styles.image} />
                ) : (
                    <div className={styles.imagePlaceholder} aria-hidden="true" />
                )}
            </div>
            <div className={styles.body}>
                <div className={styles.priceRow}>
                    {isDiscounted ? <span className={styles.oldPrice}>{number_format(oldPrice ?? 0)} Р</span> : null}
                    <span className={clsx(styles.price, isDiscounted ? styles.priceDiscount : undefined)}>
                        {number_format(price)} <ManaIcon width="16px" height="16px" />
                    </span>
                </div>
                <h3 className={styles.title}>{product.title}</h3>
                <p className={styles.description}>{product.description}</p>
                <div className={styles.controlsRow}>
                    <div className={styles.quantityControl} aria-label="Количество">
                        <button
                            type="button"
                            onClick={handleDecrease}
                            disabled={!canDecrease}
                            className={styles.quantityButton}
                        >
                            –
                        </button>
                        <span className={styles.quantityValue}>{isOutOfStock ? 0 : quantity}</span>
                        <button
                            type="button"
                            onClick={handleIncrease}
                            disabled={!canIncrease}
                            className={styles.quantityButton}
                        >
                            +
                        </button>
                    </div>
                    <span className={clsx(styles.stockLabel, isOutOfStock ? styles.stockOut : undefined)}>
                        {isOutOfStock ? "нет в наличии" : `в наличии ${stock} шт`}
                    </span>
                </div>
                <button type="button" className={styles.buyButton} disabled={isOutOfStock}>
                    {buttonLabel}
                </button>
            </div>
        </article>
    );
}
