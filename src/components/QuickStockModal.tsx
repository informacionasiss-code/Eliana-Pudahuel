import {
    Modal,
    Stack,
    TextInput,
    Group,
    Text,
    Badge,
    Button,
    PasswordInput,
    ActionIcon,
    NumberInput,
    Paper,
    Divider,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useState, useMemo } from "react";
import { Product } from "../types"; // Adjust path if needed
import { supabase } from "../lib/supabaseClient"; // Adjust path if needed
import { Search, X, Plus } from "lucide-react"; // Using lucide-react as seen in App.tsx

interface QuickStockModalProps {
    opened: boolean;
    onClose: () => void;
    products: Product[];
    onStockUpdate: () => void;
}

export function QuickStockModal({
    opened,
    onClose,
    products,
    onStockUpdate,
}: QuickStockModalProps) {
    const [search, setSearch] = useState("");
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [password, setPassword] = useState("");
    const [quantity, setQuantity] = useState<number | "">("");
    const [loading, setLoading] = useState(false);

    // Filter products based on search
    const filteredProducts = useMemo(() => {
        if (!search.trim()) return [];
        const lowerSearch = search.toLowerCase();
        return products
            .filter(
                (p) =>
                    p.name.toLowerCase().includes(lowerSearch) ||
                    p.barcode?.toLowerCase().includes(lowerSearch) ||
                    p.category?.toLowerCase().includes(lowerSearch)
            )
            .slice(0, 5); // Limit to 5 results for cleaner UI
    }, [search, products]);

    const handleClose = () => {
        setSearch("");
        setSelectedProduct(null);
        setPassword("");
        setQuantity("");
        onClose();
    };

    const handleAddStock = async () => {
        if (!selectedProduct) return;
        if (typeof quantity !== "number" || quantity <= 0) {
            notifications.show({
                title: "Cantidad inválida",
                message: "Ingresa una cantidad mayor a 0",
                color: "red",
            });
            return;
        }
        if (!password) {
            notifications.show({
                title: "Falta contraseña",
                message: "Ingresa la contraseña de autorización",
                color: "red",
            });
            return;
        }

        if (password !== "Beta2025") {
            notifications.show({
                title: "Contraseña incorrecta",
                message: "La contraseña ingresada no es válida",
                color: "red",
            });
            return;
        }

        setLoading(true);
        try {
            const newStock = (selectedProduct.stock || 0) + quantity;

            const { error } = await supabase
                .from("pudahuel_products")
                .update({
                    stock: newStock,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", selectedProduct.id);

            if (error) throw error;

            notifications.show({
                title: "Stock actualizado",
                message: `Se agregaron ${quantity} unidades a ${selectedProduct.name}. Nuevo stock: ${newStock}`,
                color: "green",
            });

            onStockUpdate(); // Refresh products in parent
            handleClose();
        } catch (error) {
            console.error("Error updating stock:", error);
            notifications.show({
                title: "Error",
                message: "No se pudo actualizar el stock. Inténtalo de nuevo.",
                color: "red",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            opened={opened}
            onClose={handleClose}
            title="Agregar stock rápido"
            size="lg"
            radius="md"
            centered
        >
            <Stack gap="md">
                <Text size="sm" c="dimmed">
                    Busca el producto y agrega la cantidad de stock recibido. Los cambios quedarán registrados en el turno.
                </Text>

                {/* Search Section */}
                {!selectedProduct && (
                    <Stack gap="xs">
                        <Text fw={500} size="sm">
                            Buscar producto
                        </Text>
                        <TextInput
                            placeholder="Nombre, categoría o código de barras..."
                            leftSection={<Search size={16} />}
                            value={search}
                            onChange={(event) => setSearch(event.currentTarget.value)}
                            autoFocus
                        />

                        {filteredProducts.length > 0 && (
                            <Paper withBorder radius="md" mt="xs">
                                <Stack gap={0}>
                                    {filteredProducts.map((product, index) => (
                                        <div key={product.id}>
                                            <Group
                                                p="sm"
                                                justify="space-between"
                                                style={{ cursor: "pointer" }}
                                                onClick={() => setSelectedProduct(product)}
                                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8f9fa")}
                                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                                            >
                                                <Stack gap={2}>
                                                    <Text fw={600} size="sm">
                                                        {product.name}
                                                    </Text>
                                                    <Text size="xs" c="dimmed">
                                                        {product.category} • SKU: {product.barcode || "S/C"}
                                                    </Text>
                                                </Stack>
                                                <Badge
                                                    color={product.stock <= (product.minStock || 5) ? "red" : "teal"}
                                                    variant="filled"
                                                >
                                                    STOCK: {product.stock}
                                                </Badge>
                                            </Group>
                                            {index < filteredProducts.length - 1 && <Divider />}
                                        </div>
                                    ))}
                                </Stack>
                            </Paper>
                        )}

                        {search && filteredProducts.length === 0 && (
                            <Text size="sm" c="dimmed" ta="center" mt="sm">No se encontraron productos</Text>
                        )}
                    </Stack>
                )}

                {/* Selected Product Section */}
                {selectedProduct && (
                    <Paper withBorder radius="md" p="md" style={{ borderColor: "#228be6" }}>
                        <Stack gap="md">
                            <Group justify="space-between">
                                <Stack gap={0}>
                                    <Text fw={700} size="lg">
                                        {selectedProduct.name}
                                    </Text>
                                    <Text size="sm" c="dimmed">
                                        {selectedProduct.category}
                                    </Text>
                                </Stack>
                                <ActionIcon variant="subtle" color="gray" onClick={() => setSelectedProduct(null)}>
                                    <X size={20} />
                                </ActionIcon>
                            </Group>

                            <Divider />

                            <Group>
                                <Text size="sm">Stock actual:</Text>
                                <Badge size="lg" color="red" variant="filled">{selectedProduct.stock} UNIDADES</Badge>
                            </Group>

                            <Stack gap={4}>
                                <Text size="sm" fw={500} c="red">
                                    Cantidad a agregar *
                                </Text>
                                <Text size="xs" c="dimmed">Nuevo stock: {(selectedProduct.stock || 0) + (typeof quantity === 'number' ? quantity : 0)} unidades</Text>
                                <NumberInput
                                    value={quantity}
                                    onChange={(val) => setQuantity(typeof val === 'number' ? val : '')}
                                    placeholder="0"
                                    min={1}
                                />
                            </Stack>
                        </Stack>
                    </Paper>
                )}

                {/* Authorization Section */}
                <Stack gap="xs">
                    <Text fw={500} size="sm">
                        Contraseña de autorización <span style={{ color: "red" }}>*</span>
                    </Text>
                    <PasswordInput
                        placeholder="Ingresa la contraseña"
                        value={password}
                        onChange={(event) => setPassword(event.currentTarget.value)}
                    />
                </Stack>

                <Group justify="flex-end" mt="md">
                    <Button variant="default" onClick={handleClose}>Cancelar</Button>
                    <Button
                        color="teal"
                        leftSection={<Plus size={16} />}
                        onClick={handleAddStock}
                        loading={loading}
                        disabled={!selectedProduct || !quantity || !password}
                    >
                        Agregar Stock
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
}
