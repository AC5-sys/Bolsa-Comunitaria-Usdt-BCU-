import tkinter as tk
from tkinter import filedialog, messagebox
import random
import json
import os
import time

# --- LÓGICA CENTRAL DE SELECCIÓN (AUDITABLE) ---

def seleccionar_ganador_verificable(txids, hash_semilla):
    """
    Función principal que implementa la selección aleatoria verificable.
    """
    if not txids:
        return None, None, "Error: La lista de TXIDs está vacía."
    
    try:
        # 1. Preparación de la Semilla: Convierte el hash hexadecimal a un entero.
        semilla_str = hash_semilla.lower().lstrip('0x')
        if not semilla_str:
             return None, None, "Error: El Hash de la Semilla no es válido o está vacío."
        
        semilla_entero = int(semilla_str, 16)
        
    except ValueError:
        return None, None, "Error: El Hash de la Semilla debe ser una cadena hexadecimal válida."

    # 2. Aplicar la Semilla y el Determinismo
    random.seed(semilla_entero)
    txids_shuffled = txids[:] 
    random.shuffle(txids_shuffled) 
    random.seed(semilla_entero) 
    
    # 3. La Selección Determinística
    txid_ganador = random.choice(txids)
    
    return txid_ganador, txids_shuffled, None

# --- FUNCIONES DE LA INTERFAZ GRÁFICA ---

class SelectorGUI:
    def __init__(self, master):
        self.master = master
        master.title("Bolsa Comunitaria USDT - Selector de Reconocimiento")
        master.geometry("600x520") 
        master.resizable(False, False)
        
        # ELIMINAMOS LA LÍNEA PROBLEMÁTICA DE master.iconbitmap(default=...)
        # El sistema operativo usará el icono predeterminado de la aplicación.
        
        # Estilos y configuración
        bg_color = "#f0f0f0"
        header_color = "#004a7c"
        
        master.configure(bg=bg_color)

        # Título
        self.label_title = tk.Label(master, text="Proceso de Selección de Reconocimiento Semanal", bg=header_color, fg="white", font=("Arial", 14, "bold"), padx=10, pady=10)
        self.label_title.pack(fill='x', pady=(0, 20))

        # --- Campo 1: Archivo JSON ---
        self.frame_file = tk.Frame(master, bg=bg_color); self.frame_file.pack(pady=5, padx=20, fill='x')
        tk.Label(self.frame_file, text="1. Archivo JSON de TXIDs:", bg=bg_color, font=("Arial", 10, "bold")).pack(anchor='w')
        self.entry_file = tk.Entry(self.frame_file, width=50, state='readonly'); self.entry_file.pack(side='left', fill='x', expand=True, padx=(0, 10))
        self.button_browse = tk.Button(self.frame_file, text="Cargar JSON", command=self.cargar_archivo, bg="#e0e0e0"); self.button_browse.pack(side='right')

        # --- Campo 2: Hash Semilla ---
        self.frame_hash = tk.Frame(master, bg=bg_color); self.frame_hash.pack(pady=10, padx=20, fill='x')
        tk.Label(self.frame_hash, text="2. Hash de Bloque BSC (Semilla Auditable):", bg=bg_color, font=("Arial", 10, "bold")).pack(anchor='w')
        self.entry_hash = tk.Entry(self.frame_hash, width=60); self.entry_hash.pack(fill='x')
        self.entry_hash.insert(0, "Ej: 0x...")

        # --- Botón de Ejecución ---
        self.button_run = tk.Button(master, text="INICIAR SELECCIÓN AUDITABLE", command=self.ejecutar_seleccion_visual, bg="#009688", fg="white", font=("Arial", 12, "bold"), padx=20, pady=10)
        self.button_run.pack(pady=20)
        
        # --- Área de Resultado y Mensajes ---
        self.label_result_title = tk.Label(master, text="ESTADO DEL PROCESO:", bg=bg_color, fg=header_color, font=("Arial", 11, "bold"))
        self.label_result_title.pack()
        
        self.result_text = tk.StringVar(master, value="--- Esperando datos ---")
        self.label_result = tk.Label(master, textvariable=self.result_text, bg="white", fg="#004a7c", font=("Consolas", 12), relief="sunken", padx=10, pady=10, wraplength=550)
        self.label_result.pack(pady=10, padx=20, fill='x')
        
        # --- Botón de Copia (Funcionalidad nativa de Tkinter/clipboard) ---
        self.button_copy = tk.Button(master, text="COPIAR TXID GANADOR", command=self.copiar_txid, bg="#ff9800", fg="white", font=("Arial", 10, "bold"), state=tk.DISABLED)
        self.button_copy.pack(pady=(5, 10))
        
        self.txids_list = []
        self.ganador_final = ""
        self.hash_semilla = ""
        self.master.update() 

    def cargar_archivo(self):
        filepath = filedialog.askopenfilename(defaultextension=".json", filetypes=[("Archivos JSON", "*.json")])
        if filepath:
            try:
                with open(filepath, 'r') as f: data = json.load(f)
                if isinstance(data, list): self.txids_list = data
                elif isinstance(data, dict): self.txids_list = data.get("txids", [])
                else: raise ValueError("El JSON debe ser una lista raíz o un objeto con la clave 'txids'.")
                self.entry_file.configure(state='normal'); self.entry_file.delete(0, tk.END)
                self.entry_file.insert(0, os.path.basename(filepath)); self.entry_file.configure(state='readonly')
                if isinstance(self.txids_list, list) and self.txids_list:
                    self.result_text.set(f"JSON cargado. {len(self.txids_list)} TXIDs listos para la selección.")
                    self.button_copy.config(state=tk.DISABLED)
                else:
                    messagebox.showwarning("Advertencia JSON", "Lista de TXIDs vacía o clave 'txids' no encontrada."); self.txids_list = []; self.result_text.set("Error: Lista de TXIDs vacía o incorrecta en JSON.")
            except json.JSONDecodeError: messagebox.showerror("Error JSON", "El archivo no tiene un formato JSON válido."); self.txids_list = []
            except ValueError as ve: messagebox.showerror("Error de Formato", str(ve)); self.txids_list = []
            except Exception as e: messagebox.showerror("Error de Carga", f"No se pudo leer el archivo: {e}"); self.txids_list = []

    def ejecutar_seleccion_visual(self):
        hash_semilla = self.entry_hash.get().strip()
        if not self.txids_list: messagebox.showwarning("Advertencia", "Por favor, cargue el archivo JSON de TXIDs primero."); return
        if len(hash_semilla) < 10 or " " in hash_semilla or not hash_semilla.startswith('0x'): messagebox.showwarning("Advertencia", "Por favor, ingrese un Hash de Bloque BSC válido (ej. 0x...)."); return

        self.ganador_final, txids_shuffled, error = seleccionar_ganador_verificable(self.txids_list, hash_semilla)
        
        if error:
            self.label_result.configure(fg="red", bg="#ffcccc"); self.result_text.set(error); messagebox.showerror("Error en el Proceso", error); return

        self.button_run.config(state=tk.DISABLED)
        self.button_copy.config(state=tk.DISABLED) 
        
        self.simulacion_paso = 0
        self.txids_shuffled = txids_shuffled 
        self.hash_semilla = hash_semilla
        self.simular_proceso()

    def simular_proceso(self):
        pasos = [
            ("🔐 VALIDANDO HASH DE BLOQUE...", 1000), 
            ("🔄 BARAJANDO TXIDs (Determinismo Fijo)...", 1000),
            ("✨ ¡SELECCIONANDO GANADOR!", 200) 
        ]
        
        if self.simulacion_paso < len(pasos):
            mensaje, delay = pasos[self.simulacion_paso]
            self.label_result_title.config(text=mensaje)
            self.label_result.config(fg="#FF9800", bg="#fff8e1") 

            if self.simulacion_paso == 1:
                random_txid = random.choice(self.txids_shuffled) 
                self.result_text.set(f"Recorriendo: {random_txid}...")
            
            self.simulacion_paso += 1
            self.master.after(delay, self.simular_proceso) 
        
        else:
            self.mostrar_resultado_final()

    def mostrar_resultado_final(self):
        self.label_result_title.config(text="✅ PROCESO FINALIZADO - TXID GANADOR (DOMINGO)")
        self.label_result.config(fg="#004a7c", bg="#e6f7ff")
        self.result_text.set(self.ganador_final)
        
        # Habilitar botones
        self.button_run.config(state=tk.NORMAL, bg="#009688") 
        self.button_copy.config(state=tk.NORMAL)
        
        messagebox.showinfo(
            "¡Proceso Completo!",
            f"El TXID Ganador es:\n\n{self.ganador_final}\n\n"
        )
        
    def copiar_txid(self):
        """Copia el TXID ganador al portapapeles usando el método nativo de Tkinter."""
        if self.ganador_final:
            try:
                self.master.clipboard_clear()
                self.master.clipboard_append(self.ganador_final)
                messagebox.showinfo("Copia Exitosa", "¡TXID copiado al portapapeles! Listo para pegar.")
            except Exception as e:
                messagebox.showerror("Error de Copia", "No se pudo copiar automáticamente. Use Ctrl+C en el campo de resultado.")
        else:
            messagebox.showwarning("Advertencia", "No hay TXID ganador para copiar.")


if __name__ == '__main__':
    root = tk.Tk()
    app = SelectorGUI(root)
    root.mainloop()