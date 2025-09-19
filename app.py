import streamlit as st
import pandas as pd
import io
from core.bom_generator import BomGenerator

# --- 1. 初始化函数 (保持不变) ---
def initialize_data():
    if 'df_明细表' not in st.session_state:
        # 确保初始值是一个DataFrame
        columns = ['款式编码', '品类', '波段', '开发颜色']
        st.session_state.df_明细表 = pd.DataFrame(columns=columns)

initialize_data()

# --- 2. UI 界面 ---
st.title("BOM协同工作流平台 (PoC)")
st.header("1. 在线编辑新品研发明细")
st.info("您可以在下表中直接添加、修改或删除行。修改后会自动保存。")

# 使用 st.data_editor 并将返回结果立即写回 session_state
# 这是最直接、最不容易出错的模式
edited_df = st.data_editor(
    st.session_state.df_明细表, # 确保这里传入的是DataFrame
    num_rows="dynamic"
)

# 无论用户是否编辑，都用 data_editor 的当前输出来更新 session_state
st.session_state.df_明细表 = edited_df

# --- 3. 选择与生成逻辑 (保持不变) ---
st.header("2. 选择款式并实时预览BOM")

# 确保在这里操作的仍然是DataFrame
df_for_selection = st.session_state.df_明细表
if isinstance(df_for_selection, pd.DataFrame):
    valid_codes = df_for_selection['款式编码'].dropna().unique().tolist()

    if not valid_codes:
        st.warning("请在上方表格中至少添加一个包含'款式编码'的有效行。")
    else:
        selected_code = st.selectbox("请选择一个款式编码进行预览:", options=valid_codes)
        
        if st.button(f"🚀 生成 '{selected_code}' 的BOM预览"):
            try:
                # 将DataFrame转为内存中的Excel文件
                output = io.BytesIO()
                with pd.ExcelWriter(output, engine='openpyxl') as writer:
                    df_for_selection.to_excel(writer, sheet_name='明细表', index=False)
                excel_data = output.getvalue()

                # 实例化BomGenerator
                generator = BomGenerator(io.BytesIO(excel_data))
                bom_buffer = generator.generate_bom_file_to_buffer(selected_code)

                st.success(f"'{selected_code}' 的BOM表已成功生成！")
                st.download_button(
                    label="📥 下载生成的BOM表 (.xlsx)",
                    data=bom_buffer,
                    file_name=f"{selected_code}.xlsx",
                    mime="application/vnd.ms-excel"
                )
            except Exception as e:
                st.error(f"生成BOM时发生错误：{e}")
else:
    st.error("数据状态错误，请刷新页面重试。")