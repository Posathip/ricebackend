import matplotlib.pyplot as plt
import numpy as np
import seaborn as sns
import matplotlib

# Set Times New Roman font with fallback
matplotlib.rcParams.update({
    'font.size': 12,
    'font.family': ['Times New Roman', 'Times', 'serif'],
    'axes.labelsize': 13,
    'axes.titlesize': 14,
    'xtick.labelsize': 11,
    'ytick.labelsize': 11,
    'figure.dpi': 120
})

# Example confusion matrix
cm = np.array([
    [69406,  430],
    [ 1937, 32150]
])

# Normalize to percentages
cm_sum = cm.sum()
cm_percent = cm / cm_sum * 100

# Labels for axes
classes = ["Benign", "Attack"]

# Create heatmap
plt.figure(figsize=(6, 5.5))
ax = sns.heatmap(cm, annot=False, fmt="d", cmap="Blues", 
                 xticklabels=classes, yticklabels=classes,
                 cbar=True, linewidths=0.6, linecolor="black")

# Add counts + percentages inside cells
for i in range(cm.shape[0]):
    for j in range(cm.shape[1]):
        # If this cell is the one with 69363 → white text
        if cm[i, j] == 69406:
            text_color = "white"
        else:
            text_color = "black"

        ax.text(j+0.5, i+0.5,
                f"{cm[i, j]}\n({cm_percent[i, j]:.2f}%)",
                ha="center", va="center",
                color=text_color, fontsize=11)

# Labels and title
plt.xlabel("Predicted", fontsize=13)
plt.ylabel("Actual", fontsize=13)
plt.title("Confusion Matrix of CNN and LSTM with Multi-Head Attention", fontsize=14, pad=12)

plt.tight_layout()
plt.show()



import matplotlib.pyplot as plt
import matplotlib

# Set Times New Roman font with fallback
matplotlib.rcParams.update({
    'font.size': 20,  # Increased font size
    'font.family': ['Times New Roman', 'Times', 'serif'],
    'axes.labelsize': 20,
    'axes.titlesize': 20,
    'xtick.labelsize': 20,
    'ytick.labelsize': 20,
    'legend.fontsize': 20,
    'figure.dpi': 120
})

# Example data (replace with your values)
labels = ["Benign", "Attack", "Suspicious"]
sizes = [59.0, 32.6, 8.4]   # percentages
colors = ["#8DD3C7", "#FFFFB3", "#B3B3CC"]

# Plot pie chart
plt.figure(figsize=(7, 7))
plt.pie(
    sizes,
    labels=labels,
    colors=colors,
    autopct="%1.1f%%",
    startangle=90,
    textprops={'fontsize': 20, 'family': 'Times New Roman'}
)

plt.title("Pie Chart of Traffic Classes", fontsize=20, pad=14, fontfamily="Times New Roman")
plt.tight_layout()
plt.show()


# import matplotlib.pyplot as plt

# # Data
# labels = ['Benign', 'Attack', 'Suspicious']
# counts = [413199, 228469, 59106]
# colors = ['green', 'red', 'orange']

# # Set font globally
# plt.rcParams['font.family'] = 'Times New Roman'
# plt.rcParams['font.size'] = 20

# # Create the bar chart
# plt.figure(figsize=(10, 6))
# bars = plt.bar(labels, counts, color=colors)

# # Title and labels
# plt.title('Summary of Traffic Classes in BCCC-Cpacket-Cloud-DDoS-2024 Dataset')
# plt.xlabel('Label')
# plt.ylabel('Record Counts')

# # Add value labels
# for bar, count in zip(bars, counts):
#     plt.text(bar.get_x() + bar.get_width()/2, bar.get_height() - 40000,
#              str(count), ha='center', va='bottom', fontsize=18, color='black')

# plt.show()
