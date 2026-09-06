import torch
import torch.nn as nn
import torchvision.transforms as transforms
from PIL import Image
import io

PLANT_DISEASE_CLASSES = [
    "Apple___Apple_scab","Apple___Black_rot","Apple___Cedar_apple_rust","Apple___healthy",
    "Blueberry___healthy","Cherry___Powdery_mildew","Cherry___healthy",
    "Corn___Cercospora_leaf_spot","Corn___Common_rust","Corn___Northern_Leaf_Blight","Corn___healthy",
    "Grape___Black_rot","Grape___Esca","Grape___Leaf_blight","Grape___healthy",
    "Orange___Haunglongbing","Peach___Bacterial_spot","Peach___healthy",
    "Pepper___Bacterial_spot","Pepper___healthy",
    "Potato___Early_blight","Potato___Late_blight","Potato___healthy",
    "Raspberry___healthy","Soybean___healthy","Squash___Powdery_mildew",
    "Strawberry___Leaf_scorch","Strawberry___healthy",
    "Tomato___Bacterial_spot","Tomato___Early_blight","Tomato___Late_blight",
    "Tomato___Leaf_Mold","Tomato___Septoria_leaf_spot","Tomato___Spider_mites",
    "Tomato___Target_Spot","Tomato___Tomato_Yellow_Leaf_Curl_Virus",
    "Tomato___Tomato_mosaic_virus","Tomato___healthy"
]

RICE_LEAF_DISEASE_CLASSES = [
    "Bacterial Leaf Blight","Brown Spot","Leaf Smut",
    "Narrow Brown Leaf Spot","Rice Blast","Sheath Blight","Healthy"
]

TRANSFORM = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])


class PlantDiseaseModel(nn.Module):
    """
    Custom CNN matching the architecture saved in your .pth checkpoints.
    Reconstructed from checkpoint key shapes:
      conv_layers: Conv→BN→Conv→BN→Pool (×4 blocks, channels 32→64→128→256)
      dense_layers: Dropout→Linear→ReLU→Dropout→Linear
    """
    def __init__(self, num_classes: int):
        super().__init__()
        self.conv_layers = nn.Sequential(
            # Block 1 — 3→32
            nn.Conv2d(3, 32, kernel_size=3, padding=1),   # 0
            nn.ReLU(inplace=True),                         # 1
            nn.BatchNorm2d(32),                            # 2
            nn.Conv2d(32, 32, kernel_size=3, padding=1),  # 3
            nn.ReLU(inplace=True),                         # 4
            nn.BatchNorm2d(32),                            # 5
            nn.MaxPool2d(2, 2),                            # 6
            # Block 2 — 32→64
            nn.Conv2d(32, 64, kernel_size=3, padding=1),  # 7
            nn.ReLU(inplace=True),                         # 8
            nn.BatchNorm2d(64),                            # 9
            nn.Conv2d(64, 64, kernel_size=3, padding=1),  # 10
            nn.ReLU(inplace=True),                         # 11
            nn.BatchNorm2d(64),                            # 12
            nn.MaxPool2d(2, 2),                            # 13
            # Block 3 — 64→128
            nn.Conv2d(64, 128, kernel_size=3, padding=1), # 14
            nn.ReLU(inplace=True),                         # 15
            nn.BatchNorm2d(128),                           # 16
            nn.Conv2d(128, 128, kernel_size=3, padding=1),# 17
            nn.ReLU(inplace=True),                         # 18
            nn.BatchNorm2d(128),                           # 19
            nn.MaxPool2d(2, 2),                            # 20
            # Block 4 — 128→256
            nn.Conv2d(128, 256, kernel_size=3, padding=1),# 21
            nn.ReLU(inplace=True),                         # 22
            nn.BatchNorm2d(256),                           # 23
            nn.Conv2d(256, 256, kernel_size=3, padding=1),# 24
            nn.ReLU(inplace=True),                         # 25
            nn.BatchNorm2d(256),                           # 26
            nn.MaxPool2d(2, 2),                            # 27
        )
        # After 4× MaxPool2d on 224px input: 224/16 = 14 → 256×14×14
        self.dense_layers = nn.Sequential(
            nn.Flatten(),                                  # 0
            nn.Linear(256 * 14 * 14, 1024),                # 1
            nn.ReLU(inplace=True),                         # 2
            nn.Dropout(0.5),                               # 3
            nn.Linear(1024, num_classes),                   # 4
        )

    def forward(self, x):
        x = self.conv_layers(x)
        x = self.dense_layers(x)
        return x


def load_model(path: str, num_classes: int, device: torch.device) -> nn.Module:
    checkpoint = torch.load(path, map_location=device, weights_only=False)

    # Read num_classes from checkpoint if available (overrides parameter)
    num_classes = checkpoint.get("num_classes", num_classes)

    model = PlantDiseaseModel(num_classes=num_classes)

    state = checkpoint.get("model_state_dict", checkpoint)
    # Strip torch.compile prefix
    state = {k.replace("_orig_mod.", ""): v for k, v in state.items()}

    model.load_state_dict(state)
    model.to(device)
    model.eval()
    return model


def predict(image_bytes: bytes, model: torch.nn.Module,
            class_names: list, device: torch.device, top_k: int = 3):
    image  = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    tensor = TRANSFORM(image).unsqueeze(0).to(device)
    with torch.no_grad():
        logits = model(tensor)
        probs  = torch.softmax(logits, dim=1)
        top_k = min(top_k, len(class_names))
        top_probs, top_idxs = probs.topk(top_k)
    return [
        {"label": class_names[i], "probability": round(float(p), 4)}
        for i, p in zip(top_idxs[0].tolist(), top_probs[0].tolist())
        if i < len(class_names)
    ]
