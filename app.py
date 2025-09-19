import streamlit as st
import pandas as pd
import io
import zipfile
from core.bom_generator import BomGenerator

# --- 1. 初始化 (保持不变) ---
def initialize_data():
    if 'df_明细表' not in st.session_state:
        columns = ['款式编码', '品类', '波段', '开发颜色']
        st.session_state.df_明细表 = pd.DataFrame(columns=columns)

initialize_data()

# --- 2. 核心UI与逻辑 ---
st.title("BOM协同工作流平台 (PoC)")
st.header("1. 在线编辑新品研发明细")
st.info("您可以在下表中直接添加、修改或删除行。修改后会自动保存。")

# 编辑器直接绑定和更新 session_state.df_明细表
# 这是整个应用中唯一会修改 DataFrame 的地方
st.data_editor(
    st.session_state.df_明细表,
    key="df_明细表",
    num_rows="dynamic"
)

st.write("---")
st.header("2. 生成并下载BOM表")

# 从 session_state 获取最新的数据
df_current = st.session_state.df_明细表
if isinstance(df_current, pd.DataFrame) and not df_current.empty:
    try:
        # 将最新的DataFrame转换为内存中的Excel文件
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df_current.to_excel(writer, sheet_name='明细表', index=False)
        excel_data = output.getvalue()
        
        # 实例化 BomGenerator
        generator = BomGenerator(io.BytesIO(excel_data))

        # 让用户选择要生成的款式
        valid_codes = df_current['款式编码'].dropna().unique().tolist()
        selected_codes = st.multiselect("请选择一个或多个要生成的款式:", valid_codes)

        if selected_codes:
            if st.button(f"🚀 批量生成 {len(selected_codes)} 个BOM表"):
                # 批量生成逻辑... (与我们第一个Streamlit版本类似)
                zip_buffer = io.BytesIO()
                with zipfile.ZipFile(zip_buffer, "w") as zip_file:
                    for code in selected_codes:
                        try:
                            bom_buffer = generator.generate_bom_file_to_buffer(code)
                            zip_file.writestr(f"{code}.xlsx", bom_buffer)
                        except Exception as e:
                            st.warning(f"生成款式 '{code}' 时失败：{e}")
                
                zip_buffer.seek(0)
                st.download_button(
                    label="📥 下载生成的BOM压缩包 (.zip)",
                    data=zip_buffer,
                    file_name="BOM_files.zip",
                    mime="application/zip"
                )

    except Exception as e:
        st.error(f"处理数据时发生严重错误：{e}")
else:
    st.warning("请在上方表格中至少添加一行有效数据以开始生成BOM表。")